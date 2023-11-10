import { PlayerPoint, Point } from '@prisma/client';
import { getCurrentGame } from './gameRepository';
import prisma from '../../lib/planetscale';

export const getCurrentPoint = async (): Promise<Point> => {
  const currentGame = await getCurrentGame();

  return await prisma.point.findFirstOrThrow({
    where: {
      gameId: currentGame.id
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
