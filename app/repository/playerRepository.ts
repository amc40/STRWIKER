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
          ownGoal: false,
        },
      },
    },
    orderBy: {
      elo: 'desc',
    },
  });

  return players.map((player) => ({
    ...player,
    totalGoals: player.playerPoints.length,
  }));
};

export const getPlayersWithOwnGoals = async () => {
  // Get all players with their own goals
  const players = await prisma.player.findMany({
    include: {
      playerPoints: {
        where: {
          ownGoal: true,
        },
      },
    },
  });

  // Map players to include own goals count
  const playersWithOwnGoals = players.map((player) => ({
    ...player,
    ownGoalsCount: player.playerPoints.length,
  }));

  // Sort by own goals count descending to easily find the highest
  return playersWithOwnGoals.sort((a, b) => b.ownGoalsCount - a.ownGoalsCount);
};

export const getPlayersInLongestPoint = async () => {
  // Find the point with the longest duration
  const points = await prisma.point.findMany({
    where: {
      startTime: { not: null },
      endTime: { not: null },
    },
    orderBy: [
      {
        startTime: 'asc',
      },
    ],
    include: {
      playerPoints: {
        include: {
          player: true,
        },
      },
    },
  });

  // Calculate durations and find the longest point
  const pointsWithDuration = points.map((point) => ({
    ...point,
    duration:
      point.endTime && point.startTime
        ? point.endTime.getTime() - point.startTime.getTime()
        : 0,
  }));

  const longestPoint = pointsWithDuration.reduce(
    (longest, current) => {
      return current.duration > longest.duration ? current : longest;
    },
    pointsWithDuration[0] || { duration: 0 },
  );

  if (!longestPoint || !longestPoint.playerPoints) {
    return [];
  }

  // Return all players who participated in this point
  return longestPoint.playerPoints.map((pp) => ({
    ...pp.player,
    pointDuration: longestPoint.duration,
  }));
};

export const getPlayersWhoLost10_0 = async () => {
  // Get all completed games ordered by end time to find most recent
  const completedGames = await prisma.game.findMany({
    where: {
      completed: true,
      endTime: { not: null },
      OR: [
        { finalScoreRed: 10, finalScoreBlue: 0 },
        { finalScoreRed: 0, finalScoreBlue: 10 },
      ],
    },
    orderBy: {
      endTime: 'desc',
    },
    include: {
      points: {
        include: {
          playerPoints: {
            include: {
              player: true,
            },
          },
        },
      },
    },
  });

  if (completedGames.length === 0) {
    return [];
  }

  // Get the most recent 10-0 game
  const mostRecentGame = completedGames[0];

  // Determine which team lost (scored 0)
  const losingTeam = mostRecentGame.finalScoreRed === 0 ? 'Red' : 'Blue';

  // Get all players from the losing team
  const losingPlayers =
    mostRecentGame.points[0]?.playerPoints
      .filter((pp) => pp.team === losingTeam)
      .map((pp) => ({
        ...pp.player,
        gameEndTime: mostRecentGame.endTime,
      })) || [];

  return losingPlayers;
};
