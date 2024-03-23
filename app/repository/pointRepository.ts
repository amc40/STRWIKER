import { Game, PlayerPoint, Point } from '@prisma/client';
import { getCurrentGame, getCurrentGameOrThrow } from './gameRepository';
import prisma from '../../lib/planetscale';

export const getCurrentPointOrThrow = async (): Promise<Point> => {
  const currentGame = await getCurrentGameOrThrow();
  return await getCurrentPointFromGameOrThrow(currentGame);
};

export const getCurrentPointFromGameOrThrow = async (
  game: Game
): Promise<Point> => {
  if (!game.currentPointId)
    throw new Error('No current point for game id ' + game.id);
  return await prisma.point.findFirstOrThrow({
    where: {
      id: game.currentPointId
    }
  });
};

export const getCurrentPointAndPlayersFromGameOrThrow = async (game: Game) => {
  if (!game.currentPointId)
    throw new Error('No current point for game id ' + game.id);
  return await prisma.point.findFirstOrThrow({
    where: {
      id: game.currentPointId
    },
    include: {
      playerPoints: {
        include: {
          player: true
        }
      }
    }
  });
};

export async function getPointFromPlayerPoint(
  playerPoint: PlayerPoint
): Promise<Point> {
  return await prisma.point.findFirstOrThrow({
    where: { id: playerPoint.pointId }
  });
}

export async function getAllPointsInCurrentGame() {
  const currentGame = await getCurrentGame();
  if (currentGame == null) return null;
  return await prisma.point.findMany({
    where: {
      gameId: currentGame.id
    }
  });
}
