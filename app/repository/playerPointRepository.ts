import { PlayerPoint, Point, Team } from '@prisma/client';
import prisma from '../../lib/planetscale';
import {
  getAllPointsInCurrentGame,
  getCurrentPointOrThrow
} from './pointRepository';

export async function getAllCurrentPlayerPoints() {
  const currentPoint = await getCurrentPointOrThrow();
  return await getAllPlayerPointsByPoint(currentPoint);
}

export async function getAllPlayerPointsByPoint(
  point: Point
): Promise<PlayerPoint[]> {
  return await prisma.playerPoint.findMany({ where: { pointId: point.id } });
}

export async function getCurrentPlayerPointForPlayerOrThrow(playerId: number) {
  const currentPoint = await getCurrentPointOrThrow();
  return await prisma.playerPoint.findFirstOrThrow({
    where: {
      pointId: currentPoint.id,
      playerId
    }
  });
}

export async function getMaxPlayerPointPositionForTeaminCurrentPoint(
  team: Team
) {
  const currentPoint = await getCurrentPointOrThrow();
  const playerPointWithMaxPosition = await prisma.playerPoint.findFirst({
    where: {
      pointId: currentPoint.id,
      team
    },
    orderBy: {
      position: 'desc'
    }
  });
  return playerPointWithMaxPosition?.position;
}

export async function getAllPlayerPointsForPlayerInCurrentGame(
  playerId: number
) {
  const currentGamePoints = await getAllPointsInCurrentGame();
  if (currentGamePoints == null) return null;
  return await prisma.playerPoint.findMany({
    where: {
      playerId,
      pointId: {
        in: currentGamePoints.map((currentGamePoint) => currentGamePoint.id)
      }
    }
  });
}

export async function deletePlayerPoint(playerPointId: number) {
  await prisma.playerPoint.delete({
    where: {
      id: playerPointId
    }
  });
}
