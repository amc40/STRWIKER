import { PlayerPoint } from '@prisma/client';
import prisma from '../../lib/planetscale';
import { getCurrentPoint } from './pointRepository';

export const getCurrentPointPlayerForPlayerIdInCurrentGame = async (
  playerId: number
): Promise<PlayerPoint> => {
  const currentPoint = await getCurrentPoint();

  return await prisma.playerPoint.findFirstOrThrow({
    where: {
      pointId: currentPoint.id,
      playerId
    }
  });
};
