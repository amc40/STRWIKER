import { PlayerPoint, Point } from '@prisma/client';
import prisma from '../../lib/planetscale';

export async function getAllPlayerPointsByPoint(
  point: Point
): Promise<PlayerPoint[]> {
  return await prisma.playerPoint.findMany({ where: { pointId: point.id } });
}
