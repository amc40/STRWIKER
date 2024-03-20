import { Game, PlayerPoint, Point, Team } from '@prisma/client';
import prisma from '../../lib/planetscale';
import { getAllPlayerPointsByPoint } from '../repository/playerPointRepository';
import { PlayerPointPositionService } from './playerPointPositionService';
import { getCurrentGameOrThrow } from '../repository/gameRepository';
import { getCurrentPointFromGameOrThrow } from '../repository/pointRepository';

export class GameLogicService {
  NUMBER_OF_POINTS_TO_WIN = 10;

  playerPointPositionService = new PlayerPointPositionService();

  async startGame() {
    await prisma.$transaction(async () => {
      // TODO: set rotaty dependant on number of players
      const game = await prisma.game.create({
        data: { completed: false, rotatyBlue: 'Always', rotatyRed: 'Always' }
      });
      const initialPoint = await this.createPoint(0, 0, game);
      await prisma.game.update({
        where: {
          id: game.id
        },
        data: {
          currentPointId: initialPoint.id
        }
      });
    });
  }

  private async createPoint(
    currentRedScore: number,
    currentBlueScore: number,
    game: Game
  ) {
    return await prisma.point.create({
      data: { currentRedScore, currentBlueScore, gameId: game.id }
    });
  }

  async addPlayer(playerId: number, team: Team) {
    const currentGame = await getCurrentGameOrThrow();
    if (currentGame.currentPointId === null) {
      throw new Error('current point id is null');
    }
    const position =
      await this.playerPointPositionService.getNewPlayerPositionForTeam(team);
    await prisma.playerPoint.create({
      data: {
        ownGoal: false,
        position,
        rattled: false,
        scoredGoal: false,
        team,
        playerId,
        pointId: currentGame.currentPointId
      }
    });
  }

  async scoreGoal(
    scorerPlayerPoint: PlayerPoint,
    ownGoal: boolean,
    finishedPoint: Point,
    game: Game
  ) {
    await prisma.$transaction(async () => {
      const updatePlayerScored = prisma.playerPoint.update({
        where: {
          id: scorerPlayerPoint.id
        },
        data: {
          scoredGoal: !ownGoal,
          ownGoal: ownGoal
        }
      });

      const updatePointEndTime = prisma.point.update({
        where: {
          id: finishedPoint.id
        },
        data: {
          endTime: new Date()
        }
      });

      const scoringTeam = ownGoal
        ? this.opposingTeam(scorerPlayerPoint.team)
        : scorerPlayerPoint.team;

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
          newRedScore
        );
      }
      await Promise.all([updatePlayerScored, updatePointEndTime]);
    });
  }

  private isGameOver(newBlueScore: number, newRedScore: number) {
    return (
      newBlueScore >= this.NUMBER_OF_POINTS_TO_WIN &&
      newRedScore >= this.NUMBER_OF_POINTS_TO_WIN
    );
  }

  private async setupNextPoint(
    finishedPoint: Point,
    scoringTeam: Team,
    game: Game,
    newBlueScore: number,
    newRedScore: number
  ) {
    const newPoint = await prisma.point.create({
      data: {
        currentBlueScore: newBlueScore,
        currentRedScore: newRedScore,
        gameId: game.id
      }
    });
    const oldPlayerPoints = await getAllPlayerPointsByPoint(finishedPoint);

    const redPlayerPoints = oldPlayerPoints.filter(
      (playerPoint) => playerPoint.team === Team.Red
    );
    const bluePlayerPoints = oldPlayerPoints.filter(
      (playerPoint) => playerPoint.team === Team.Blue
    );

    const numberOfPlayersPerTeam: Record<Team, number> = {
      Red: redPlayerPoints.length,
      Blue: bluePlayerPoints.length
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
        game
      )
    }));

    await prisma.playerPoint.createMany({
      data: newPlayerPointsToCreate
    });

    await prisma.game.update({
      where: {
        id: game.id
      },
      data: {
        currentPointId: newPoint.id
      }
    });
  }

  async endGame(game: Game, finalScoreBlue: number, finalScoreRed: number) {
    await prisma.game.update({
      where: {
        id: game.id
      },
      data: {
        completed: true,
        finalScoreBlue,
        finalScoreRed
      }
    });
  }

  async abandonCurrentGame() {
    const currentGame = await getCurrentGameOrThrow();

    const currentPoint = await getCurrentPointFromGameOrThrow(currentGame);

    await this.abandonGame(
      currentGame,
      currentPoint.currentBlueScore,
      currentPoint.currentRedScore
    );
  }

  private async abandonGame(
    game: Game,
    finalScoreBlue: number,
    finalScoreRed: number
  ) {
    await prisma.game.update({
      where: {
        id: game.id
      },
      data: {
        abandoned: true,
        finalScoreBlue,
        finalScoreRed
      }
    });
  }

  private opposingTeam(team: Team) {
    return team === Team.Red ? Team.Blue : Team.Red;
  }
}
