import { Game, Player } from '@prisma/client';
import prisma from '../../lib/planetscale';

export interface PlayerWithoutStatValues {
  id: number;
  name: string;
}

export const createPlayer = async (name: string) => {
  await prisma.player.create({
    data: {
      name,
    },
  });
};

export const getAllPlayersNameAscIdAsc = async () => {
  return await prisma.player.findMany({
    orderBy: [
      {
        name: 'asc',
      },
      {
        id: 'asc',
      },
    ],
  });
};

export const getPlayersWithIdsIn = async (playerIds: number[]) => {
  return await prisma.player.findMany({
    where: {
      id: {
        in: playerIds,
      },
    },
  });
};

export const getPlayersOrderedByDescendingElos = async () => {
  return await prisma.player.findMany({
    orderBy: {
      elo: 'desc',
    },
  });
};

export const getPlayersWhoParticipatedInGame = async (
  game: Game,
): Promise<Player[]> => {
  return await prisma.player.findMany({
    where: {
      playerPoints: {
        some: {
          point: {
            gameId: game.id,
          },
        },
      },
    },
  });
};

export const getPlayersWithTotalGoals = async () => {
  const players = await prisma.player.findMany({
    include: {
      playerPoints: {
        where: {
          scoredGoal: true,
          ownGoal: false
        }
      }
    },
    orderBy: {
      elo: 'desc'
    }
  });

  return players.map(player => ({
    ...player,
    totalGoals: player.playerPoints.length
  }));
};

export const getPlayersInLongestPoint = async () => {
  // Find the point with the longest duration
  const points = await prisma.point.findMany({
    where: {
      startTime: { not: null },
      endTime: { not: null }
    },
    orderBy: [
      {
        startTime: 'asc'
      }
    ],
    include: {
      playerPoints: {
        include: {
          player: true
        }
      }
    }
  });

  // Calculate durations and find the longest point
  const pointsWithDuration = points.map(point => ({
    ...point,
    duration: point.endTime && point.startTime 
      ? point.endTime.getTime() - point.startTime.getTime()
      : 0
  }));

  const longestPoint = pointsWithDuration.reduce((longest, current) => {
    return current.duration > longest.duration ? current : longest;
  }, pointsWithDuration[0] || { duration: 0 });

  if (!longestPoint || !longestPoint.playerPoints) {
    return [];
  }

  // Return all players who participated in this point
  return longestPoint.playerPoints.map(pp => ({
    ...pp.player,
    pointDuration: longestPoint.duration
  }));
};
