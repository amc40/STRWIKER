import React from 'react';
import { StatsTable } from '../stats-table/StatsTable';
import { StatsTHead } from '../stats-table/StatsTHead';
import { StatsHeadTR } from '../stats-table/StatsHeadTR';
import { StatsTH } from '../stats-table/StatsTH';
import { StatsTR } from '../stats-table/StatsBodyTR';
import { StatsTBody } from '../stats-table/StatsTBody';
import { StatsTD } from '../stats-table/StatsTD';
import { Player } from '@prisma/client';

interface PointLengthWithParticipants {
  id: number;
  blueScore: number;
  redScore: number;
  durationInSeconds: number;
  blueParticipants: Player[];
  redParticipants: Player[];
}

interface LongestPointsTableProps {
  longestPointsWithParticipants: PointLengthWithParticipants[];
}

export const LongestPointsTable: React.FC<LongestPointsTableProps> = ({
  longestPointsWithParticipants,
}) => {
  return (
    <StatsTable>
      <StatsTHead>
        <StatsHeadTR>
          <StatsTH>🔵 Blue Score</StatsTH>
          <StatsTH>🔴 Red Score</StatsTH>
          <StatsTH>🔵 Blue Participants</StatsTH>
          <StatsTH>🔴 Red Participants</StatsTH>
          <StatsTH>⏱️ Length</StatsTH>
        </StatsHeadTR>
      </StatsTHead>
      <StatsTBody>
        {longestPointsWithParticipants.map(
          ({
            id,
            blueScore,
            redScore,
            blueParticipants,
            redParticipants,
            durationInSeconds,
          }) => (
            <StatsTR key={id}>
              <StatsTD>{blueScore}</StatsTD>
              <StatsTD>{redScore}</StatsTD>
              <StatsTD>
                {blueParticipants
                  .map((participant) => participant.name)
                  .join(', ')}
              </StatsTD>
              <StatsTD>
                {redParticipants
                  .map((participant) => participant.name)
                  .join(', ')}
              </StatsTD>
              <StatsTD>{durationInSeconds}</StatsTD>
            </StatsTR>
          ),
        )}
      </StatsTBody>
    </StatsTable>
  );
};
