import { $Enums, Game, Player, PlayerPoint, Todo } from '@prisma/client';
import prisma from '../../../lib/planetscale';


export const GET = async function handler(req: Request) {
  const currentGame = await prisma.game.findFirst({
    orderBy: {
      startTime: 'desc'
    }
  });
  if (!currentGame) {
    throw new Error('current game not found');
  }

  return Response.json(currentGame as Game);
};
