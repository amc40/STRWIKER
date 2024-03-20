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

export async function getAllPlayerPointsAndPlayersByPoint(point: Point) {
  return await prisma.playerPoint.findMany({
    where: {
      pointId: point.id
    },
    include: {
      player: true
    }
  });
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

export async function getMaxPlayerPointPositionForTeamInPoint(
  team: Team,
  point: Point
) {
  const playerPointWithMaxPosition = await prisma.playerPoint.findFirst({
    where: {
      pointId: point.id,
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

export async function getPlayerPointsInPositionRangeForTeam(
  pointId: number,
  team: Team,
  inclusiveLowerBound: number,
  exclusiveUpperBound: number
) {
  return await prisma.playerPoint.findMany({
    where: {
      AND: [
        { position: { gte: inclusiveLowerBound } },
        { position: { lt: exclusiveUpperBound } }
      ],
      pointId,
      team
    }
  });
}

export async function incrementPlayerPointPositions(
  playerPoints: PlayerPoint[]
) {
  await prisma.playerPoint.updateMany({
    where: {
      id: {
        in: playerPoints.map((playerPoint) => playerPoint.id)
      }
    },
    data: {
      position: {
        increment: 1
      }
    }
  });
}

export async function decrementPlayerPointPositions(
  playerPoints: PlayerPoint[]
) {
  await prisma.playerPoint.updateMany({
    where: {
      id: {
        in: playerPoints.map((playerPoint) => playerPoint.id)
      }
    },
    data: {
      position: {
        decrement: 1
      }
    }
  });
}

export async function setPlayerPointPosition(
  playerPoint: PlayerPoint,
  newPosition: number
) {
  await prisma.playerPoint.update({
    where: {
      id: playerPoint.id
    },
    data: {
      position: newPosition
    }
  });
}
