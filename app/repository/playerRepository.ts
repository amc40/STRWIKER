import prisma from '../../lib/planetscale';

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
