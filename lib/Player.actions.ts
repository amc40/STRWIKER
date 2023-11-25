'use server';

import { Player, Prisma } from '@prisma/client';
import prisma from './planetscale';

export const addPlayer = async ({ name }: Prisma.PlayerCreateInput) => {
  await prisma.player.create({
    data: {
      name
    }
  });
};

export const getPlayers = async (): Promise<Player[]> => {
  const players = await prisma.player.findMany({
    orderBy: [
      {
        name: 'asc'
      },
      {
        id: 'asc'
      }
    ]
  });
  return players;
};
