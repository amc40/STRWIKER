import { Game } from '@prisma/client';
import prisma from '../../lib/planetscale';

export const getCurrentGame = async (): Promise<Game> => {
  return await prisma.game.findFirstOrThrow({
    where: {
      completed: false
    }
  });
};
