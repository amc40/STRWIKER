import prisma from '../../../lib/planetscale';
import { Game, Prisma } from '@prisma/client';

type RequestData = {};

type ResponseData = Game;

export const POST = async function handler(req: Request) {
  const game = await prisma.game.create({
    data: {
      completed: false
    } as Prisma.GameCreateInput
  });

  const initialPoint = await prisma.point.create({
    data: {
      gameId: game.id,
      currentBlueScore: 0,
      currentRedScore: 0
    }
  });

  await prisma.game.update({
    where: {
      id: game.id
    },
    data: {
      currentPointId: initialPoint.id
    }
  });

  return Response.json(game as ResponseData);
};
