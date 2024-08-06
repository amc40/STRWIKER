import { Game, Player } from '@prisma/client';
import prisma from '../../lib/planetscale';

export interface PlayerWithoutStatValues {
  id: number;
  name: string;
}

export const createPlayer = async (name: string) => {
  await prisma.player.create({
    data: {
      name,
    },
  });
};

export const getAllPlayersNameAscIdAsc = async () => {
  return await prisma.player.findMany({
    orderBy: [
      {
        name: 'asc',
      },
      {
        id: 'asc',
      },
    ],
  });
};

export const getPlayersWithIdsIn = async (playerIds: number[]) => {
  return await prisma.player.findMany({
    where: {
      id: {
        in: playerIds,
      },
    },
  });
};

export const getPlayersOrderedByDescendingElos = async () => {
  return await prisma.player.findMany({
    orderBy: {
      elo: 'desc',
    },
  });
};

export const getPlayersWhoParticipatedInGame = async (
  game: Game,
): Promise<Player[]> => {
  return await prisma.player.findMany({
    where: {
      playerPoints: {
        some: {
          point: {
            gameId: game.id,
          },
        },
      },
    },
  });
};
