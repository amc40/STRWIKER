import { Game, Player, PlayerPoint, Point, Prisma } from '@prisma/client';
import prisma from '../../lib/planetscale';
import { getPlayerFromPlayerPoint, getPointFromPlayerPoint } from './dbService';

export class GameLogicService {
  startGame() {
    prisma.game.create({ data: { completed: false } });
  }

  createPlayer(name: string) {
    prisma.player.create({ data: { name } });
  }

  async reorderPlayerPoint(
    id: number,
    oldPosition: number,
    newPosition: number
  ) {
    prisma.playerPoint.update({
      where: {
        id
      },
      data: {
        position: newPosition
      }
    });

    if (newPosition > oldPosition) {
      // pushing it back
      const playerPoints = await prisma.playerPoint.findMany({
        where: {
          AND: [
            { position: { gt: oldPosition } },
            { position: { lte: newPosition } }
          ]
        }
      });

      playerPoints.forEach((pp) => {
        prisma.playerPoint.update({
          where: {
            id: pp.id
          },
          data: {
            position: pp.position - 1
          }
        });
      });
    } else {
      // pulling it foward
      const playerPoints = await prisma.playerPoint.findMany({
        where: {
          AND: [
            { position: { lt: oldPosition } },
            { position: { gte: newPosition } }
          ]
        }
      });

      playerPoints.forEach((pp) => {
        prisma.playerPoint.update({
          where: {
            id: pp.id
          },
          data: {
            position: pp.position + 1
          }
        });
      });
    }
  }

  createPoint(currentRedScore: number, currentBlueScore: number, game: Game) {
    prisma.point.create({
      data: { currentRedScore, currentBlueScore, gameId: game.id }
    });
  }

  async scoreGoal(playerPoint: PlayerPoint, ownGoal: boolean) {
    prisma.playerPoint.update({
      where: {
        id: playerPoint.id
      },
      data: {
        scoredGoal: !ownGoal,
        ownGoal: ownGoal
      }
    });

    const scoringTeam = ownGoal
      ? playerPoint.team
      : opposingTeam(playerPoint.team);
    const currentPoint = await getPointFromPlayerPoint(playerPoint);
    currentPoint;
    prisma.point.create({
      data: {
        currentBlueScore:
          currentPoint.currentBlueScore + (scoringTeam === 'Blue' ? 1 : 0),
        currentRedScore:
          currentPoint.currentRedScore + (scoringTeam === 'Red' ? 1 : 0),
        gameId: currentPoint.gameId
      }
    });
  }
}

function opposingTeam(team: string) {
  return team === 'red' ? 'blue' : 'red';
}

enum TeamScore {
  currentRedScore = 'currentRedScore',
  currentBlueScore = 'currentBlueScore'
}
