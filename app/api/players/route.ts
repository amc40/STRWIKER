import { NextResponse } from 'next/server';
import prisma from '../../../lib/planetscale';
import { Player } from '@prisma/client';
import { NextApiRequest, NextApiResponse } from 'next';

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

export const GET = async function handler(req: Request) {
  const players = await prisma.player.findMany();
  return Response.json(players as Player[]);
};
