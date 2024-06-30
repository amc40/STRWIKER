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

export const doesGameIdExist = async (gameId: number) => {
  const numberOfGamesWithId = await prisma.game.count({
    where: {
      id: gameId,
    },
  });
  return numberOfGamesWithId > 0;
};

export const getAllNotInProgressGameIds = async () => {
  const wrappedGameIds = await prisma.game.findMany({
    select: {
      id: true,
    },
    where: {
      NOT: {
        completed: false,
        abandoned: false,
      },
    },
  });
  return wrappedGameIds.map(({ id }) => id);
};

export const markGameAsCompleted = async (
  game: Game,
  finalScoreBlue: number,
  finalScoreRed: number,
) => {
  await prisma.game.update({
    where: {
      id: game.id,
    },
    data: {
      completed: true,
      finalScoreBlue,
      finalScoreRed,
    },
  });
};
