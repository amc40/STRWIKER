import { Game, Player, PlayerPoint, Point, Prisma } from '@prisma/client';
import prisma from '../../lib/planetscale';
export class GameLogicService {
  startGame() {
    prisma.game.create({ data: { currentPoint: undefined } });
  }

  createPlayer(name: string) {
    prisma.player.create({ data: { name } });
  }

  createPoint(currentRedScore: number, currentBlueScore: number, game: Game) {
    prisma.point.create({
      data: { currentRedScore, currentBlueScore, gameId: game.id }
    });
  }
}
