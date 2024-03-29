import { Game, PlayerPoint, Point, Team } from '@prisma/client';
import prisma from '../../lib/planetscale';
import {
  decrementPlayerPointPositionsInPointAfter,
  deletePlayerPoint,
  getAllPlayerPointsByPoint,
  getCurrentPlayerPointForPlayerOrThrow,
  getPlayerPointByPlayerAndPointOrThrow,
} from '../repository/playerPointRepository';
import { PlayerPointPositionService } from './playerPointPositionService';
import { getCurrentGameOrThrow } from '../repository/gameRepository';
import {
  getPointAndPlayersFromPointIdOrThrow,
  getCurrentPointFromGameOrThrow,
  getCurrentPointOrThrow,
} from '../repository/pointRepository';
import { StatsEngineFwoar } from './statsEngine';

export class GameLogicService {
  NUMBER_OF_POINTS_TO_WIN = 10;

  playerPointPositionService = new PlayerPointPositionService();
  statsEngine = new StatsEngineFwoar();

  async startGame() {
    await prisma.$transaction(async () => {
      // TODO: set rotaty dependant on number of players
      const game = await prisma.game.create({
        data: { completed: false, rotatyBlue: 'Always', rotatyRed: 'Always' },
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
        ownGoal: false,
        position,
        rattled: false,
        scoredGoal: false,
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

  async scoreGoalInCurrentGame(playerId: number, ownGoal: boolean) {
    const gameLogicService = new GameLogicService();

    const currentGame = await getCurrentGameOrThrow();

    const currentPoint = await getCurrentPointFromGameOrThrow(currentGame);

    const playerPoint = await getPlayerPointByPlayerAndPointOrThrow(
      playerId,
      currentPoint.id,
    );

    await gameLogicService.scoreGoal(
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
  ) {
    await prisma.$transaction(async () => {
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

      const scoringTeam = ownGoal
        ? this.opposingTeam(scorerPlayerPoint.team)
        : scorerPlayerPoint.team;

      const updatePlayerElos = this.updateElosForPlayersInPoint(
        scoringTeam,
        finishedPoint,
      );

      const newBlueScore =
        finishedPoint.currentBlueScore + (scoringTeam === Team.Blue ? 1 : 0);
      const newRedScore =
        finishedPoint.currentRedScore + (scoringTeam === Team.Red ? 1 : 0);

      if (this.isGameOver(newBlueScore, newRedScore)) {
        await this.endGame(game, newBlueScore, newRedScore);
      } else {
        await this.setupNextPoint(
          finishedPoint,
          scoringTeam,
          game,
          newBlueScore,
          newRedScore,
        );
      }

      await Promise.all([
        updatePlayerScored,
        updatePointEndTime,
        updatePlayerElos,
      ]);
    });
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

    const redPlayerPoints = oldPlayerPoints.filter(
      (playerPoint) => playerPoint.team === Team.Red,
    );
    const bluePlayerPoints = oldPlayerPoints.filter(
      (playerPoint) => playerPoint.team === Team.Blue,
    );

    const numberOfPlayersPerTeam: Record<Team, number> = {
      Red: redPlayerPoints.length,
      Blue: bluePlayerPoints.length,
    };

    const newPlayerPointsToCreate = oldPlayerPoints.map((oldPlayerPoint) => ({
      playerId: oldPlayerPoint.playerId,
      pointId: newPoint.id,
      ownGoal: false,
      scoredGoal: false,
      rattled: false,
      team: oldPlayerPoint.team,
      position: this.playerPointPositionService.getNextPlayerPositionForTeam(
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
    await prisma.game.update({
      where: {
        id: game.id,
      },
      data: {
        completed: true,
        finalScoreBlue,
        finalScoreRed,
      },
    });
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

  private opposingTeam(team: Team) {
    return team === Team.Red ? Team.Blue : Team.Red;
  }
}
