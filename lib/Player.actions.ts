'use server';

import { Player, Prisma } from '@prisma/client';
import {
  createPlayer,
  getAllPlayersNameAscIdAsc,
} from '../app/repository/playerRepository';
import { revalidatePath } from 'next/cache';

export const addPlayer = async ({ name }: Prisma.PlayerCreateInput) => {
  await createPlayer(name);
  registerPlayersChange();
};

export const getPlayers = async (): Promise<Player[]> => {
  return getAllPlayersNameAscIdAsc();
};

const registerPlayersChange = () => {
  revalidatePath('/players-admin');
};
