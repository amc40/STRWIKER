import { Game, PlayerPoint, Point, Prisma, Team } from '@prisma/client';
import prisma from '../../lib/planetscale';
import { getPointFromPlayerPoint } from '../repository/pointRepository';
import { getAllPlayerPointsByPoint } from '../repository/playerPointRepository';
import { getCurrentGameOrThrow } from '../repository/gameRepository';

export class GameLogicService {
  NUMBER_OF_POINTS_TO_WIN = 10;

  async startGame() {
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
  }

  createPlayer(name: string) {
    prisma.player.create({ data: { name } });
  }

  async reorderPlayerPoint(
    reorderPlayerPoint: PlayerPoint,
    newPosition: number
  ) {
    const oldPosition = reorderPlayerPoint.position;
    await prisma.$transaction(async () => {
      if (newPosition > oldPosition) {
        // pushing it back
        const playerPoints = await prisma.playerPoint.findMany({
          where: {
            AND: [
              { position: { gt: oldPosition } },
              { position: { lte: newPosition } }
            ],
            pointId: reorderPlayerPoint.pointId,
            team: reorderPlayerPoint.team
          }
        });

        await prisma.playerPoint.updateMany({
          where: {
            id: {
              in: playerPoints.map((playerPoint) => playerPoint.id)
            }
          },
          data: {
            position: {
              decrement: 1
            }
          }
        });
      } else {
        // pulling it foward
        const playerPoints = await prisma.playerPoint.findMany({
          where: {
            AND: [
              { position: { lt: oldPosition } },
              { position: { gte: newPosition } }
            ],
            pointId: reorderPlayerPoint.pointId,
            team: reorderPlayerPoint.team
          }
        });

        await prisma.playerPoint.updateMany({
          where: {
            id: {
              in: playerPoints.map((playerPoint) => playerPoint.id)
            }
          },
          data: {
            position: {
              increment: 1
            }
          }
        });
      }

      await prisma.playerPoint.update({
        where: {
          id: reorderPlayerPoint.id
        },
        data: {
          position: newPosition
        }
      });
    });
  }

  async createPoint(
    currentRedScore: number,
    currentBlueScore: number,
    game: Game
  ) {
    return await prisma.point.create({
      data: { currentRedScore, currentBlueScore, gameId: game.id }
    });
  }

  async scoreGoal(
    scorerPlayerPoint: PlayerPoint,
    ownGoal: boolean,
    finishedPoint: Point,
    game: Game
  ) {
    await prisma.playerPoint.update({
      where: {
        id: scorerPlayerPoint.id
      },
      data: {
        scoredGoal: !ownGoal,
        ownGoal: ownGoal
      }
    });

    await prisma.point.update({
      where: {
        id: finishedPoint.id
      },
      data: {
        endTime: new Date()
      }
    });

    const scoringTeam = ownGoal
      ? opposingTeam(scorerPlayerPoint.team)
      : scorerPlayerPoint.team;

    const newBlueScore =
      finishedPoint.currentBlueScore + (scoringTeam === Team.Blue ? 1 : 0);
    const newRedScore =
      finishedPoint.currentRedScore + (scoringTeam === Team.Red ? 1 : 0);

    if (
      newBlueScore < this.NUMBER_OF_POINTS_TO_WIN &&
      newRedScore < this.NUMBER_OF_POINTS_TO_WIN
    ) {
      this.setupNextPoint(
        finishedPoint,
        scoringTeam,
        game,
        newBlueScore,
        newRedScore
      );
    } else {
      await this.endGame(game, newBlueScore, newRedScore);
    }
  }

  async setupNextPoint(
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

    const redPlayers = oldPlayerPoints.filter(
      (playerPoint) => playerPoint.team === Team.Red
    );
    const bluePlayers = oldPlayerPoints.filter(
      (playerPoint) => playerPoint.team === Team.Blue
    );

    const newPlayerPointsToCreate = oldPlayerPoints.map((oldPlayerPoint) => ({
      playerId: oldPlayerPoint.playerId,
      pointId: newPoint.id,
      ownGoal: false,
      scoredGoal: false,
      rattled: false,
      team: oldPlayerPoint.team,
      position: getNextPlayerPosition(
        oldPlayerPoint.position,
        oldPlayerPoint.team == Team.Red
          ? redPlayers.length
          : bluePlayers.length,
        isTeamRotating(oldPlayerPoint.team, game, scoringTeam)
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

  async rotatePlayers(playerPoints: PlayerPoint[]) {
    playerPoints.sort((a, b) => a.position - b.position);
    this.reorderPlayerPoint(playerPoints[0], playerPoints.length - 1);
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
}

function getNextPlayerPosition(
  previousPosition: number,
  numberOfPlayersOnTeam: number,
  isTeamRotating: boolean
) {
  if (!isTeamRotating) return previousPosition;
  const newPosition =
    previousPosition === 0 ? numberOfPlayersOnTeam - 1 : previousPosition - 1;
  return newPosition;
}

function isTeamRotating(team: Team, game: Game, scoringTeam: Team) {
  const rotationStrategy = getTeamRotationStrategyInGame(team, game);
  switch (rotationStrategy) {
    case 'Never':
      return false;
    case 'Always':
      return true;
    case 'OnConcede':
      return team !== scoringTeam;
  }
}

function getTeamRotationStrategyInGame(team: Team, game: Game) {
  switch (team) {
    case 'Red':
      return game.rotatyRed;
    case 'Blue':
      return game.rotatyBlue;
  }
}

function opposingTeam(team: Team) {
  return team === Team.Red ? Team.Blue : Team.Red;
}
