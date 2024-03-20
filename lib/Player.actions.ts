'use server';

import { Player, Prisma } from '@prisma/client';
import {
  createPlayer,
  getAllPlayersNameAscIdAsc
} from '../app/repository/playerRepository';

export const addPlayer = async ({ name }: Prisma.PlayerCreateInput) => {
  return await createPlayer(name);
};

export const getPlayers = async (): Promise<Player[]> => {
  return getAllPlayersNameAscIdAsc();
};
