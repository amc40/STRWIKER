import { PlayerPoint, Point, Team } from '@prisma/client';
import prisma from '../../lib/planetscale';
import { getAllPointsInCurrentGame, getCurrentPoint } from './pointRepository';

export async function getAllCurrentPlayerPoints() {
  const currentPoint = await getCurrentPoint();
  return await getAllPlayerPointsByPoint(currentPoint);
}

export async function getAllPlayerPointsByPoint(
  point: Point
): Promise<PlayerPoint[]> {
  return await prisma.playerPoint.findMany({ where: { pointId: point.id } });
}

export async function getCurrentPlayerPointForPlayer(playerId: number) {
  const currentPoint = await getCurrentPoint();
  return await prisma.playerPoint.findFirst({
    where: {
      pointId: currentPoint.id,
      playerId
    }
  });
}

export async function getMaxPlayerPointPositionForTeaminCurrentPoint(
  team: Team
) {
  const currentPoint = await getCurrentPoint();
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
