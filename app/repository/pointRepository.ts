import { Game, PlayerPoint, Point } from '@prisma/client';
import { getCurrentGameOrThrow } from './gameRepository';
import prisma from '../../lib/planetscale';
import { PrimaryButton } from '../components/PrimaryButton';

export const getCurrentPointOrThrow = async (): Promise<Point> => {
  const currentGame = await getCurrentGameOrThrow();
  return await getCurrentPointFromGameOrThrow(currentGame);
};

export const getCurrentPointFromGameOrThrow = async (
  game: Game,
): Promise<Point> => {
  if (!game.currentPointId)
    throw new Error('No current point for game id ' + game.id);
  return await prisma.point.findFirstOrThrow({
    where: {
      id: game.currentPointId,
    },
  });
};

export const getCurrentPointAndPlayersFromGameOrThrow = async (game: Game) => {
  if (!game.currentPointId)
    throw new Error('No current point for game id ' + game.id);
  return await getPointAndPlayersFromPointIdOrThrow(game.currentPointId);
};

export const getPointAndPlayersFromPointIdOrThrow = async (pointId: number) => {
  return await prisma.point.findFirstOrThrow({
    where: {
      id: pointId,
    },
    include: {
      playerPoints: {
        include: {
          player: true,
        },
      },
    },
  });
};

export async function getPointFromPlayerPoint(
  playerPoint: PlayerPoint,
): Promise<Point> {
  return await prisma.point.findFirstOrThrow({
    where: { id: playerPoint.pointId },
  });
}

export async function getAllPointsInGame(gameId: number) {
  return await prisma.point.findMany({
    where: {
      gameId,
    },
  });
}

export async function setPointStartTime(pointId: number, startTime: Date) {
  return await prisma.point.update({
    data: {
      startTime,
    },
    where: {
      id: pointId,
    },
  });
}
