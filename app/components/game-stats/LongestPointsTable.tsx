import React from 'react';
import { StatsTable } from '../stats-table/StatsTable';
import { StatsTHead } from '../stats-table/StatsTHead';
import { StatsHeadTR } from '../stats-table/StatsHeadTR';
import { StatsTH } from '../stats-table/StatsTH';
import { StatsTR } from '../stats-table/StatsBodyTR';
import { StatsTBody } from '../stats-table/StatsTBody';
import { StatsTD } from '../stats-table/StatsTD';
import { Player } from '@prisma/client';
import moment from 'moment';
import 'moment-duration-format';

interface PointLengthWithActivePlayers {
  id: number;
  currentRedScore: number;
  currentBlueScore: number;
  durationInSeconds: number;
  blueActivePlayers: Player[];
  redActivePlayers: Player[];
}

interface LongestPointsTableProps {
  longestPointsWithActivePlayers: PointLengthWithActivePlayers[];
}

export const LongestPointsTable: React.FC<LongestPointsTableProps> = ({
  longestPointsWithActivePlayers,
}) => {
  return (
    <StatsTable>
      <StatsTHead>
        <StatsHeadTR>
          <StatsTH>Blue Players</StatsTH>
          <StatsTH>Score</StatsTH>
          <StatsTH className="py-3 px-2 md:px-6 text-right">
            Red Players
          </StatsTH>
          <StatsTH>⏱️ Length</StatsTH>
        </StatsHeadTR>
      </StatsTHead>
      <StatsTBody>
        {longestPointsWithActivePlayers.map(
          ({
            id,
            currentBlueScore: blueScore,
            currentRedScore: redScore,
            blueActivePlayers,
            redActivePlayers,
            durationInSeconds,
          }) => (
            <StatsTR key={id}>
              <StatsTD>
                <span className="flex items-center gap-2 md:gap-3">
                  <span>🔵</span>
                  <span>
                    {blueActivePlayers
                      .map((activePlayer) => activePlayer.name)
                      .join(', ')}
                  </span>
                </span>
              </StatsTD>
              <StatsTD>
                <span className="whitespace-nowrap">{`${blueScore.toFixed()} - ${redScore.toFixed()}`}</span>
              </StatsTD>
              <StatsTD>
                <span className="flex justify-end items-center gap-2 md:gap-3">
                  <span className="text-right">
                    {redActivePlayers
                      .map((activePlayer) => activePlayer.name)
                      .join(', ')}
                  </span>
                  <span>🔴</span>
                </span>
              </StatsTD>
              <StatsTD>
                {moment
                  .duration(durationInSeconds, 'seconds')
                  .format('m [min] s [s]')}
              </StatsTD>
            </StatsTR>
          ),
        )}
      </StatsTBody>
    </StatsTable>
  );
};
