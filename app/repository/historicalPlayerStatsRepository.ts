import { HistoricalPlayerStats, Player, Prisma } from '@prisma/client';
import prisma from '../../lib/planetscale';

export type HistoricalPlayerStatValues = Omit<
  HistoricalPlayerStats,
  'id' | 'playerId' | 'gameId'
>;

type MostRecentHistoricalPlayerStatsBeforeThresholdReturn = (Player &
  // these are delibarately separated as the value should be null on all of the non-nullable fields only if there isn't a HistoricalPlayerStat before the threshold for the player
  (| {
        previousElo: number;
        previousGamesPlayed: number;
      }
    | {
        previousElo: null;
        previousGamesPlayed: null;
      }
  ))[];

export const getMostRecentHistoricalPlayerStatsBeforeThreshold = async (
  upperThresholdTime: Date,
) => {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-assertion
  return (await prisma.$queryRaw(
    Prisma.sql`
      SELECT 
          "Player".*,
          "MostRecentHistoricalPlayerStatsBeforeThreshold".elo as "previousElo",
          "MostRecentHistoricalPlayerStatsBeforeThreshold"."gamesPlayed" as "previousGamesPlayed"
      FROM 
          "Player"
      LEFT JOIN LATERAL (
          SELECT 
              "HistoricalPlayerStats".*,
              "Game"."endTime"
          FROM 
              "HistoricalPlayerStats"
          INNER JOIN 
              "Game" ON "Game".id = "HistoricalPlayerStats"."gameId"
          WHERE 
              "HistoricalPlayerStats"."playerId" = "Player".id
              AND "Game"."endTime" <  ${upperThresholdTime}
          ORDER BY 
              "Game"."endTime" DESC
          LIMIT 1
      ) AS "MostRecentHistoricalPlayerStatsBeforeThreshold" ON true;
    `,
  )) as MostRecentHistoricalPlayerStatsBeforeThresholdReturn;
};

export const getHistoricalPlayerStatsInGameId = async (gameId: number) => {
  return await prisma.historicalPlayerStats.findMany({
    where: {
      gameId,
    },
  });
};
