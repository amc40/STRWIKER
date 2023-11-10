import { Point } from '@prisma/client';
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
