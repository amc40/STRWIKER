import { Game } from '@prisma/client';
import prisma from '../../lib/planetscale';

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
}
