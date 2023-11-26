import { PlayerPoint, Point, Team } from '@prisma/client';
import prisma from '../../lib/planetscale';
import { getCurrentPoint } from './pointRepository';

export async function getAllCurrentPlayerPoints() {
  const currentPoint = await getCurrentPoint();
  return await getAllPlayerPointsByPoint(currentPoint);
}

export async function getAllPlayerPointsByPoint(
  point: Point
): Promise<PlayerPoint[]> {
  return await prisma.playerPoint.findMany({ where: { pointId: point.id } });
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
