import { Player, Prisma } from '@prisma/client';
import prisma from '../../lib/planetscale';

type MostRecentHistoricalPlayerStatsBeforeThresholdReturn = (Player & {
  previousElo: number | null;
  previousGamesPlayer: number | null;
})[];

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
