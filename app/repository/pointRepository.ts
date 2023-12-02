import { Game, PlayerPoint, Point } from '@prisma/client';
import { getCurrentGame } from './gameRepository';
import prisma from '../../lib/planetscale';

export const getCurrentPoint = async (): Promise<Point> => {
  const currentGame = await getCurrentGame();
  return await getCurrentPointFromGame(currentGame);
};

export const getCurrentPointFromGame = async (game: Game): Promise<Point> => {
  if (!game.currentPointId)
    throw new Error('No current point for game id ' + game.id);
  return await prisma.point.findFirstOrThrow({
    where: {
      id: game.currentPointId
    }
  });
};

export async function getPointFromPlayerPoint(
  playerPoint: PlayerPoint
): Promise<Point> {
  return await prisma.point.findFirstOrThrow({
    where: { id: playerPoint.pointId }
  });
}

export async function getAllPointsInCurrentGame() {
  const currentGame = await getCurrentGame();
  return await prisma.point.findMany({
    where: {
      gameId: currentGame.id
    }
  });
}
