import prisma from '../../../lib/planetscale';
import { Player } from '@prisma/client';

type RequestData = {
  name: string;
};

type ResponseData = Player;

export const POST = async function handler(req: Request) {
  const player = await prisma.player.create({
    data: (await req.json()) as RequestData
  });

  return Response.json(player as ResponseData);
};
