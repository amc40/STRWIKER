import {
  Game,
  Player,
  PlayerPoint,
  Point,
  Prisma,
  RotatyStrategy,
  Team,
} from '@prisma/client';
import prisma from '../../lib/planetscale';
import {
  decrementPlayerPointPositionsInPointAfter,
  deletePlayerPoint,
  getAllPlayerPointsAndPlayersByPointWherePositionLessThan,
  getAllPlayerPointsByPoint,
  getCurrentPlayerPointForPlayerOrThrow,
  getPlayerPointByPlayerAndPointOrThrow,
} from '../repository/playerPointRepository';
import { PlayerPointPositionService } from './playerPointPositionService';
import {
  getCurrentGameOrThrow,
  getMostRecentFinishedGameWithLastPointAndParticipatingPlayers,
  markGameAsCompleted,
} from '../repository/gameRepository';
import {
  getPointAndPlayersFromPointIdOrThrow,
  getCurrentPointFromGameOrThrow,
  getCurrentPointOrThrow,
} from '../repository/pointRepository';
import { StatsEngineFwoar } from './statsEngine';
import { getPlayersWhoParticipatedInGame } from '../repository/playerRepository';

export enum IsGameEnd {
  GAME_CONTINUES,
  GAME_ENDS,
}

export class GameLogicService {
  NUMBER_OF_POINTS_TO_WIN = 10;

  playerPointPositionService = new PlayerPointPositionService();
  statsEngine = new StatsEngineFwoar();

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

    // TODO: set rotaty dependant on number of players
    const game = await prisma.game.create({
      data: {
        completed: false,
        rotatyBlue: rotatyStrategyPerTeam?.Blue ?? 'Always',
        rotatyRed: rotatyStrategyPerTeam?.Red ?? 'Always',
      },
    });

    const initialPoint = await this.createPoint(0, 0, game);
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

    const numberOfPlayersPerTeam = this.getNumberOfPlayersPerTeam(
      playerPointsFromLastPointOfPreviousGame,
    );

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

    const newPlayerPointsCreateInput: Prisma.PlayerPointCreateManyInput[] =
      playerPointsFromLastPointOfPreviousGame.map(
        ({ team, playerId, position: previousPosition }) => ({
          team,
          playerId,
          position:
            this.playerPointPositionService.getNextPlayerPositionForTeamWithRotatyStrategy(
              previousPosition,
              team,
              numberOfPlayersPerTeam,
              teamWhoWonLastPointOfPreviousGame,
              rotatyStrategy[team],
            ),
          pointId: initialPoint.id,
        }),
      );

    await prisma.playerPoint.createMany({
      data: newPlayerPointsCreateInput,
    });
  }

  private async createPoint(
    currentRedScore: number,
    currentBlueScore: number,
    game: Game,
  ) {
    return await prisma.point.create({
      data: { currentRedScore, currentBlueScore, gameId: game.id },
    });
  }

  async addPlayerToCurrentPoint(playerId: number, team: Team) {
    const currentPoint = await getCurrentPointOrThrow();
    return this.addPlayerToPoint(playerId, team, currentPoint);
  }

  private async addPlayerToPoint(playerId: number, team: Team, point: Point) {
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
  }

  async removePlayerFromCurrentPoint(playerId: number) {
    const currentPlayerPointForPlayer =
      await getCurrentPlayerPointForPlayerOrThrow(playerId);

    await prisma.$transaction(async () => {
      const deletePlayerPointPromise = deletePlayerPoint(
        currentPlayerPointForPlayer.id,
      );

      const decrementPlayerPointPositionssAfterRemovedPlayerPromise =
        decrementPlayerPointPositionsInPointAfter(
          currentPlayerPointForPlayer.pointId,
          currentPlayerPointForPlayer.position,
        );
      await Promise.all([
        deletePlayerPointPromise,
        decrementPlayerPointPositionssAfterRemovedPlayerPromise,
      ]);
    });
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

    const numberOfPlayersPerTeam =
      this.getNumberOfPlayersPerTeam(oldPlayerPoints);

    const newPlayerPointsToCreate = oldPlayerPoints.map((oldPlayerPoint) => ({
      playerId: oldPlayerPoint.playerId,
      pointId: newPoint.id,
      ownGoal: false,
      scoredGoal: false,
      rattled: false,
      team: oldPlayerPoint.team,
      position:
        this.playerPointPositionService.getNextPlayerPositionForTeamInGame(
          oldPlayerPoint.position,
          oldPlayerPoint.team,
          numberOfPlayersPerTeam,
          scoringTeam,
          game,
        ),
    }));

    await prisma.playerPoint.createMany({
      data: newPlayerPointsToCreate,
    });

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
        (playerPoint) => playerPoint.position <= 1,
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
}
