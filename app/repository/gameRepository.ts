import { Game, RotatyStrategy, Team } from '@prisma/client';
import prisma from '../../lib/planetscale';

export const getCurrentGame = async (): Promise<Game | null> => {
  return await prisma.game.findFirst({
    where: {
      completed: false,
      abandoned: false,
    },
  });
};

export const getCurrentGameOrThrow = async (): Promise<Game> => {
  return await prisma.game.findFirstOrThrow({
    where: {
      completed: false,
      abandoned: false,
    },
  });
};

export const updateRotatyStrategy = async (
  game: Game,
  rotatyStrategy: RotatyStrategy,
  team: Team,
) => {
  await prisma.game.update({
    where: {
      id: game.id,
    },
    data: {
      rotatyBlue: team === 'Blue' ? rotatyStrategy : undefined,
      rotatyRed: team === 'Red' ? rotatyStrategy : undefined,
    },
  });
};
