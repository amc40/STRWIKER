import { Player, PlayerPoint, Point } from '@prisma/client';
import prisma from '../../lib/planetscale';

export async function getPlayerFromPlayerPoint(
  playerPoint: PlayerPoint
): Promise<Player> {
  return await prisma.player.findFirstOrThrow({
    where: { id: playerPoint.playerId }
  });
}

export async function getPointFromPlayerPoint(
  playerPoint: PlayerPoint
): Promise<Point> {
  return await prisma.point.findFirstOrThrow({
    where: { id: playerPoint.pointId }
  });
}
