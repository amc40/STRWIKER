import {
  Game,
  Player,
  PlayerPoint,
  Point,
  Prisma,
  RotatyStrategy,
  StrikerPosition,
  Team,
} from '@prisma/client';
import prisma from '../../lib/planetscale';
import {
  clearSkippedForPlayerPoints,
  decrementPlayerPointPositionsInPointAndTeamAfter,
  deletePlayerPoint,
  getAllPlayerPointsAndPlayersByPointWherePositionLessThan,
  getAllPlayerPointsByPoint,
  getAllPlayerPointsForTeamInPoint,
  getPlayerPointByPlayerAndPointOrThrow,
  updateStrikerDefenderFlagsForPlayerPoints,
} from '../repository/playerPointRepository';
import {
  PlayerPointPositionService,
  RotationResult,
} from './playerPointPositionService';
import {
  getCurrentGameOrThrow,
  getMostRecentFinishedGameWithLastPointAndParticipatingPlayers,
  markGameAsCompleted,
} from '../repository/gameRepository';
import {
  getPointAndPlayersFromPointIdOrThrow,
  getCurrentPointFromGameOrThrow,
  getCurrentPointOrThrow,
  setPointStartTime,
} from '../repository/pointRepository';
import { updateRotatyStrategyForTeamAndGameId } from '../repository/gameRepository';
import { StatsEngineFwoar } from './statsEngine';
import { getPlayersWhoParticipatedInGame } from '../repository/playerRepository';

export enum IsGameEnd {
  GAME_CONTINUES,
  GAME_ENDS,
}

export class GameLogicService {
  NUMBER_OF_POINTS_TO_WIN = 10;
  private playerPointPositionService = new PlayerPointPositionService();
  private statsEngine = new StatsEngineFwoar();

  async startFreshGame() {
    await prisma.$transaction(
      async () => {
        await this.startGameWithNoPlayerPointsAndGetInitialPoint();
      },
      {
        timeout: 10000,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  // Should be called within a Serializable transaction
  private async startGameWithNoPlayerPointsAndGetInitialPoint(
    rotatyStrategyPerTeam?: Record<Team, RotatyStrategy>,
  ): Promise<Point> {
    const existingGameInProgress = await prisma.game.findFirst({
      where: {
        completed: false,
        abandoned: false,
      },
    });

    if (existingGameInProgress != null) {
      throw new Error('Cannot create game as one is already in progress');
    }

    const defaultRotationStrategy =
      this.getDefaultRotationStrategyForTeamSize(0);
    const game = await prisma.game.create({
      data: {
        completed: false,
        rotatyBlue: rotatyStrategyPerTeam?.Blue ?? defaultRotationStrategy,
        rotatyRed: rotatyStrategyPerTeam?.Red ?? defaultRotationStrategy,
      },
    });

    const initialPoint = await this.createInitialPoint(game);
    await prisma.game.update({
      where: {
        id: game.id,
      },
      data: {
        currentPointId: initialPoint.id,
      },
    });
    return initialPoint;
  }

  async startGameFromPreviousGame() {
    await prisma.$transaction(
      async () => {
        const previousGame =
          await getMostRecentFinishedGameWithLastPointAndParticipatingPlayers();

        const playerPointsFromLastPointOfPreviousGame =
          previousGame.currentPoint?.playerPoints;

        if (playerPointsFromLastPointOfPreviousGame == null) {
          throw new Error(
            `The most recent finished game doesn't have a current point: ${JSON.stringify(
              playerPointsFromLastPointOfPreviousGame,
            )}`,
          );
        }

        const rotatyStrategyPerTeam =
          this.getRotatyStrategyPerTeam(previousGame);

        if (previousGame.abandoned) {
          await this.startGameFromPreviousAbandonedGame(
            playerPointsFromLastPointOfPreviousGame,
            rotatyStrategyPerTeam,
          );
        } else if (previousGame.completed) {
          await this.startGameFromPreviousCompletedGame(
            playerPointsFromLastPointOfPreviousGame,
            rotatyStrategyPerTeam,
          );
        } else {
          // TODO: why was this not causing the transaction to rollback when it was outside the else
          throw new Error(
            `The most recent finished game is neither abandoned or completed: ${JSON.stringify(
              previousGame,
            )}`,
          );
        }
      },
      {
        timeout: 10000,
        isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
      },
    );
  }

  private async startGameFromPreviousAbandonedGame(
    playerPointsFromLastPointOfPreviousGame: PlayerPoint[],
    rotatyStrategy: Record<Team, RotatyStrategy>,
  ) {
    const initialPoint =
      await this.startGameWithNoPlayerPointsAndGetInitialPoint(rotatyStrategy);

    const newPlayerPointsCreateInput: Prisma.PlayerPointCreateManyInput[] =
      playerPointsFromLastPointOfPreviousGame.map(
        ({ team, playerId, position: previousPosition }) => ({
          team,
          playerId,
          position: previousPosition,
          pointId: initialPoint.id,
        }),
      );

    await prisma.playerPoint.createMany({
      data: newPlayerPointsCreateInput,
    });
  }

  private async startGameFromPreviousCompletedGame(
    playerPointsFromLastPointOfPreviousGame: PlayerPoint[],
    rotatyStrategy: Record<Team, RotatyStrategy>,
  ) {
    const initialPoint =
      await this.startGameWithNoPlayerPointsAndGetInitialPoint(rotatyStrategy);

    const playerPointWhoScoredLastPoint =
      playerPointsFromLastPointOfPreviousGame.find(
        ({ scoredGoal, ownGoal }) => scoredGoal || ownGoal,
      );

    if (playerPointWhoScoredLastPoint == null) {
      throw new Error('Should have a player who scored the last point');
    }

    const teamWhoWonLastPointOfPreviousGame = this.getScoringTeam(
      playerPointWhoScoredLastPoint.team,
      playerPointWhoScoredLastPoint.ownGoal,
    );

    // Step 1: Calculate rotated positions using same skip-aware logic
    const rotationResults = this.calculateRotationResultsPerTeam(
      playerPointsFromLastPointOfPreviousGame,
      (team) =>
        this.playerPointPositionService.calculateRotatedPositionsForTeamWithRotatyStrategy(
          playerPointsFromLastPointOfPreviousGame.filter(
            (pp) => pp.team === team,
          ),
          team,
          teamWhoWonLastPointOfPreviousGame,
          rotatyStrategy[team],
        ),
    );

    // Step 2: Create new PlayerPoints with calculated positions (preserving skipped flag)
    const newPlayerPointsCreateInput: Prisma.PlayerPointCreateManyInput[] =
      playerPointsFromLastPointOfPreviousGame.map(
        ({ team, playerId, skipped }) => ({
          team,
          playerId,
          skipped,
          position:
            rotationResults[team].positionsByPlayerId.get(playerId) ?? 0,
          pointId: initialPoint.id,
        }),
      );

    await prisma.playerPoint.createMany({
      data: newPlayerPointsCreateInput,
    });

    // Step 3: Clear skipped flag for players that were rotated to the back
    await this.clearSkipsForRotatedPlayers(initialPoint.id, rotationResults);

    // Compute and set striker/defender flags
    // New game gets default striker position
    const newGame = await getCurrentGameOrThrow();
    await this.recomputeStrikerDefenderFlagsForAllTeams(
      initialPoint.id,
      newGame.strikerPosition,
    );
  }

  private async createInitialPoint(game: Game) {
    return await prisma.point.create({
      data: {
        currentRedScore: 0,
        currentBlueScore: 0,
        gameId: game.id,
        // initial point must be explicitly started to avoid setup time being counted towards playing time
        startTime: null,
      },
    });
  }

  async addPlayerToCurrentPoint(playerId: number, team: Team) {
    const currentPoint = await getCurrentPointOrThrow();
    return this.addPlayerToPoint(playerId, team, currentPoint);
  }

  private async addPlayerToPoint(playerId: number, team: Team, point: Point) {
    await prisma.$transaction(async () => {
      const position =
        await this.playerPointPositionService.getNewPlayerPositionForTeam(
          team,
          point,
        );
      await prisma.playerPoint.create({
        data: {
          position,
          team,
          playerId,
          pointId: point.id,
        },
      });

      await this.updateRotationStrategyBasedOnTeamSize(team, point);

      const currentGame = await getCurrentGameOrThrow();
      await this.recomputeStrikerDefenderFlagsForTeam(
        point.id,
        team,
        currentGame.strikerPosition,
      );
    });
  }

  async removePlayerFromCurrentPoint(playerId: number) {
    const currentPoint = await getCurrentPointOrThrow();
    await this.removePlayerFromPoint(playerId, currentPoint);
  }

  private async removePlayerFromPoint(playerId: number, point: Point) {
    await prisma.$transaction(async () => {
      const playerPoint = await getPlayerPointByPlayerAndPointOrThrow(
        playerId,
        point.id,
      );

      const deletePlayerPointPromise = deletePlayerPoint(playerPoint.id);

      const decrementPlayerPointPositionssAfterRemovedPlayerPromise =
        decrementPlayerPointPositionsInPointAndTeamAfter(
          playerPoint.pointId,
          playerPoint.team,
          playerPoint.position,
        );
      await Promise.all([
        deletePlayerPointPromise,
        decrementPlayerPointPositionssAfterRemovedPlayerPromise,
      ]);

      await this.updateRotationStrategyBasedOnTeamSize(playerPoint.team, point);

      const currentGame = await getCurrentGameOrThrow();
      await this.recomputeStrikerDefenderFlagsForTeam(
        point.id,
        playerPoint.team,
        currentGame.strikerPosition,
      );
    });
  }

  async startCurrentPoint() {
    const currentPoint = await getCurrentPointOrThrow();
    const startTime = new Date();
    await setPointStartTime(currentPoint.id, startTime);
  }

  async toggleSkipForPlayerInCurrentPoint(playerId: number) {
    const currentGame = await getCurrentGameOrThrow();
    const currentPoint = await getCurrentPointOrThrow();
    const playerPoint = await getPlayerPointByPlayerAndPointOrThrow(
      playerId,
      currentPoint.id,
    );

    const newSkipped = !playerPoint.skipped;

    // Validate: don't allow all players on a team to become skipped
    if (newSkipped) {
      const teamPlayerPoints = await getAllPlayerPointsForTeamInPoint(
        currentPoint.id,
        playerPoint.team,
      );
      const nonSkippedCount = teamPlayerPoints.filter(
        (pp) => !pp.skipped && pp.playerId !== playerId,
      ).length;
      if (nonSkippedCount === 0) {
        throw new Error(
          'Cannot skip: at least one player on the team must remain active',
        );
      }
    }

    await prisma.playerPoint.update({
      where: { id: playerPoint.id },
      data: { skipped: newSkipped },
    });

    await this.recomputeStrikerDefenderFlagsForTeam(
      currentPoint.id,
      playerPoint.team,
      currentGame.strikerPosition,
    );
  }

  async scoreGoalInCurrentGame(
    playerId: number,
    ownGoal: boolean,
  ): Promise<IsGameEnd> {
    const gameLogicService = new GameLogicService();

    const currentGame = await getCurrentGameOrThrow();

    const currentPoint = await getCurrentPointFromGameOrThrow(currentGame);

    const playerPoint = await getPlayerPointByPlayerAndPointOrThrow(
      playerId,
      currentPoint.id,
    );

    return await gameLogicService.scoreGoal(
      playerPoint,
      ownGoal,
      currentPoint,
      currentGame,
    );
  }

  private async scoreGoal(
    scorerPlayerPoint: PlayerPoint,
    ownGoal: boolean,
    finishedPoint: Point,
    game: Game,
  ): Promise<IsGameEnd> {
    return await prisma.$transaction(
      async () => {
        const updatePlayerScored = prisma.playerPoint.update({
          where: {
            id: scorerPlayerPoint.id,
          },
          data: {
            scoredGoal: !ownGoal,
            ownGoal: ownGoal,
          },
        });

        const updatePointEndTime = prisma.point.update({
          where: {
            id: finishedPoint.id,
          },
          data: {
            endTime: new Date(),
          },
        });

        const scoringTeam = this.getScoringTeam(
          scorerPlayerPoint.team,
          ownGoal,
        );

        const updatePlayerElos = this.updateElosForPlayersInPoint(
          scoringTeam,
          finishedPoint,
        );

        const newBlueScore =
          finishedPoint.currentBlueScore + (scoringTeam === Team.Blue ? 1 : 0);
        const newRedScore =
          finishedPoint.currentRedScore + (scoringTeam === Team.Red ? 1 : 0);

        let isGameEnd: IsGameEnd;
        if (this.isGameOver(newBlueScore, newRedScore)) {
          // we need to read the updated player elos when updating the game stats
          await Promise.all([updatePlayerElos]);
          await this.endGame(game, newBlueScore, newRedScore);
          isGameEnd = IsGameEnd.GAME_ENDS;
        } else {
          await this.setupNextPoint(
            finishedPoint,
            scoringTeam,
            game,
            newBlueScore,
            newRedScore,
          );
          isGameEnd = IsGameEnd.GAME_CONTINUES;
        }

        await Promise.all([
          updatePlayerScored,
          updatePointEndTime,
          updatePlayerElos,
        ]);
        return isGameEnd;
      },
      {
        // Although this is the default behaviour, I've made it explicit here as
        // ReadUncommitted would cause errors in saving the historical transaction stats
        // (as we write the update player elos and then go on to read them in order to populate the update player stats)
        isolationLevel: Prisma.TransactionIsolationLevel.ReadCommitted,
      },
    );
  }

  private isGameOver(newBlueScore: number, newRedScore: number) {
    return (
      newBlueScore >= this.NUMBER_OF_POINTS_TO_WIN ||
      newRedScore >= this.NUMBER_OF_POINTS_TO_WIN
    );
  }

  private async setupNextPoint(
    finishedPoint: Point,
    scoringTeam: Team,
    game: Game,
    newBlueScore: number,
    newRedScore: number,
  ) {
    const newPoint = await prisma.point.create({
      data: {
        currentBlueScore: newBlueScore,
        currentRedScore: newRedScore,
        gameId: game.id,
      },
    });
    const oldPlayerPoints = await getAllPlayerPointsByPoint(finishedPoint);

    // Step 1: Calculate rotated positions for each team
    const rotationResults = this.calculateRotationResultsPerTeam(
      oldPlayerPoints,
      (team) =>
        this.playerPointPositionService.calculateRotatedPositionsForTeamInGame(
          oldPlayerPoints.filter((pp) => pp.team === team),
          team,
          scoringTeam,
          game,
        ),
    );

    // Step 2: Create new PlayerPoints with calculated positions (preserving skipped flag)
    const newPlayerPointsToCreate = oldPlayerPoints.map((oldPlayerPoint) => ({
      playerId: oldPlayerPoint.playerId,
      pointId: newPoint.id,
      ownGoal: false,
      scoredGoal: false,
      rattled: false,
      skipped: oldPlayerPoint.skipped,
      team: oldPlayerPoint.team,
      position:
        rotationResults[oldPlayerPoint.team].positionsByPlayerId.get(
          oldPlayerPoint.playerId,
        ) ?? oldPlayerPoint.position,
    }));

    await prisma.playerPoint.createMany({
      data: newPlayerPointsToCreate,
    });

    // Step 3: Clear skipped flag for players that were rotated to the back
    await this.clearSkipsForRotatedPlayers(newPoint.id, rotationResults);

    // Compute and set striker/defender flags
    await this.recomputeStrikerDefenderFlagsForAllTeams(
      newPoint.id,
      game.strikerPosition,
    );

    await prisma.game.update({
      where: {
        id: game.id,
      },
      data: {
        currentPointId: newPoint.id,
      },
    });
  }

  async endGame(game: Game, finalScoreBlue: number, finalScoreRed: number) {
    const markGameAsCompletedPromise = markGameAsCompleted(
      game,
      finalScoreBlue,
      finalScoreRed,
    );

    // we could potentially do this without blocking the response using waitUntil() if we run into performance issues with endGame()
    const updateplayerStatsAtGameEndPromise =
      this.updatePlayerStatsAtGameEnd(game);

    await Promise.all([
      markGameAsCompletedPromise,
      updateplayerStatsAtGameEndPromise,
    ]);
  }

  private async updatePlayerStatsAtGameEnd(game: Game) {
    const allParticipantsInGame = await getPlayersWhoParticipatedInGame(game);
    await this.statsEngine.updatePlayerStatsAtEndOfGame(
      allParticipantsInGame,
      game,
    );
  }

  async abandonCurrentGame() {
    const currentGame = await getCurrentGameOrThrow();

    const currentPoint = await getCurrentPointFromGameOrThrow(currentGame);

    await this.abandonGame(
      currentGame,
      currentPoint.currentBlueScore,
      currentPoint.currentRedScore,
    );
  }

  private async abandonGame(
    game: Game,
    finalScoreBlue: number,
    finalScoreRed: number,
  ) {
    await prisma.game.update({
      where: {
        id: game.id,
      },
      data: {
        abandoned: true,
        finalScoreBlue,
        finalScoreRed,
        endTime: new Date(),
      },
    });
  }

  private async updateElosForPlayersInPoint(scoringTeam: Team, point: Point) {
    const participatingPlayers = await this.getParticipatingPlayersInPoint(
      point.id,
    );

    const winningPlayers = participatingPlayers.filter(
      (player) => player.team === scoringTeam,
    );
    const losingPlayers = participatingPlayers.filter(
      (player) => player.team !== scoringTeam,
    );

    await this.statsEngine.updateElosOnGoal(winningPlayers, losingPlayers);
  }

  private async getParticipatingPlayersInPoint(pointId: number) {
    const { playerPoints: allPlayersPointsAndPlayersInPoint } =
      await getPointAndPlayersFromPointIdOrThrow(pointId);
    const participatingPlayerPointsAndPlayersInPoint =
      allPlayersPointsAndPlayersInPoint.filter(
        (playerPoint) => playerPoint.isStriker || playerPoint.isDefender,
      );
    return participatingPlayerPointsAndPlayersInPoint.map((playerPoint) => ({
      ...playerPoint.player,
      team: playerPoint.team,
    }));
  }

  async joinPointWithActivePlayers<T extends Point>(
    point: T,
  ): Promise<T & { blueActivePlayers: Player[]; redActivePlayers: Player[] }> {
    const playerPointsWithActivePlayers =
      await getAllPlayerPointsAndPlayersByPointWherePositionLessThan(
        point,
        PlayerPointPositionService.ACTIVE_PLAYER_MAX_POSITION,
      );

    const blueActivePlayers = playerPointsWithActivePlayers
      .filter((playerPoint) => playerPoint.team === Team.Blue)
      .map(
        (playerPointWithParticipatingPlayer) =>
          playerPointWithParticipatingPlayer.player,
      );

    const redActivePlayers = playerPointsWithActivePlayers
      .filter((playerPoint) => playerPoint.team === Team.Red)
      .map(
        (playerPointWithParticipatingPlayer) =>
          playerPointWithParticipatingPlayer.player,
      );

    return {
      ...point,
      blueActivePlayers,
      redActivePlayers,
    };
  }

  async recomputeStrikerDefenderFlagsForTeam(
    pointId: number,
    team: Team,
    strikerPosition: StrikerPosition,
  ) {
    const teamPlayerPoints = await getAllPlayerPointsForTeamInPoint(
      pointId,
      team,
    );
    const flags = this.playerPointPositionService.computeStrikerDefenderFlags(
      teamPlayerPoints,
      team,
      strikerPosition,
    );

    const updates = teamPlayerPoints.map((pp) => ({
      id: pp.id,
      isStriker: flags.get(pp.playerId)?.isStriker ?? false,
      isDefender: flags.get(pp.playerId)?.isDefender ?? false,
    }));

    await updateStrikerDefenderFlagsForPlayerPoints(updates);
  }

  private async recomputeStrikerDefenderFlagsForAllTeams(
    pointId: number,
    strikerPosition: StrikerPosition,
  ) {
    await Promise.all([
      this.recomputeStrikerDefenderFlagsForTeam(
        pointId,
        Team.Red,
        strikerPosition,
      ),
      this.recomputeStrikerDefenderFlagsForTeam(
        pointId,
        Team.Blue,
        strikerPosition,
      ),
    ]);
  }

  private calculateRotationResultsPerTeam(
    allPlayerPoints: PlayerPoint[],
    calculateForTeam: (team: Team) => RotationResult,
  ): Record<Team, RotationResult> {
    const teams: Team[] = [Team.Red, Team.Blue];
    const results = {} as Record<Team, RotationResult>;
    for (const team of teams) {
      const teamHasPlayers = allPlayerPoints.some((pp) => pp.team === team);
      if (teamHasPlayers) {
        results[team] = calculateForTeam(team);
      } else {
        results[team] = {
          positionsByPlayerId: new Map(),
          playerIdsToUnskip: new Set(),
        };
      }
    }
    return results;
  }

  private async clearSkipsForRotatedPlayers(
    newPointId: number,
    rotationResults: Record<Team, RotationResult>,
  ) {
    const allPlayerIdsToUnskip: number[] = [];
    for (const team of [Team.Red, Team.Blue] as Team[]) {
      rotationResults[team].playerIdsToUnskip.forEach((playerId) => {
        allPlayerIdsToUnskip.push(playerId);
      });
    }

    if (allPlayerIdsToUnskip.length === 0) return;

    // Find the new PlayerPoint IDs for the players that need unskipping
    const newPointPlayerPoints = await prisma.playerPoint.findMany({
      where: {
        pointId: newPointId,
        playerId: { in: allPlayerIdsToUnskip },
      },
    });

    await clearSkippedForPlayerPoints(newPointPlayerPoints.map((pp) => pp.id));
  }

  private opposingTeam(team: Team) {
    return team === Team.Red ? Team.Blue : Team.Red;
  }

  private getNumberOfPlayersPerTeam(
    playerPoints: { team: Team }[],
  ): Record<Team, number> {
    const redPlayerPoints = playerPoints.filter(
      (playerPoint) => playerPoint.team === Team.Red,
    );
    const bluePlayerPoints = playerPoints.filter(
      (playerPoint) => playerPoint.team === Team.Blue,
    );

    return {
      Red: redPlayerPoints.length,
      Blue: bluePlayerPoints.length,
    };
  }

  private getScoringTeam(scorerTeam: Team, ownGoal: boolean) {
    return ownGoal ? this.opposingTeam(scorerTeam) : scorerTeam;
  }

  private getRotatyStrategyPerTeam(game: Game): Record<Team, RotatyStrategy> {
    return {
      Red: game.rotatyRed,
      Blue: game.rotatyBlue,
    };
  }

  private async updateRotationStrategyBasedOnTeamSize(
    team: Team,
    point: Point,
  ) {
    const playerPoints = await getAllPlayerPointsByPoint(point);
    const numberOfPlayersPerTeam = this.getNumberOfPlayersPerTeam(playerPoints);
    const teamPlayerCount = numberOfPlayersPerTeam[team];

    const newStrategy =
      this.getDefaultRotationStrategyForTeamSize(teamPlayerCount);

    await updateRotatyStrategyForTeamAndGameId(point.gameId, newStrategy, team);
  }

  private getDefaultRotationStrategyForTeamSize(
    numberOfPlayers: number,
  ): RotatyStrategy {
    return numberOfPlayers <= 2 ? RotatyStrategy.Never : RotatyStrategy.Always;
  }
}
