import React from 'react';
import { StatsTable } from '../stats-table/StatsTable';
import { StatsTHead } from '../stats-table/StatsTHead';
import { StatsTBody } from '../stats-table/StatsTBody';
import { StatsHeadTR } from '../stats-table/StatsHeadTR';
import { StatsTH } from '../stats-table/StatsTH';
import { StatsTR } from '../stats-table/StatsBodyTR';
import { StatsTD } from '../stats-table/StatsTD';
import { Player } from '@prisma/client';

interface NumberOfGoalsScoredTableProps {
  playersAndNumberOfGoalsScored: {
    player: Player;
    goalsScored: number;
  }[];
}

export const NumberOfGoalsScoredTable: React.FC<
  NumberOfGoalsScoredTableProps
> = ({ playersAndNumberOfGoalsScored }) => {
  return (
    <StatsTable>
      <StatsTHead>
        <StatsHeadTR>
          <StatsTH></StatsTH>
          <StatsTH>Player Name</StatsTH>
          <StatsTH>Goals Scored</StatsTH>
        </StatsHeadTR>
      </StatsTHead>
      <StatsTBody>
        {playersAndNumberOfGoalsScored.length === 0 ? (
          <StatsTR>
            <StatsTD className="py-4 text-center" colSpan={3}>
              🤔 No goals in this game
            </StatsTD>
          </StatsTR>
        ) : null}
        {playersAndNumberOfGoalsScored.map(({ player, goalsScored }, index) => (
          <StatsTR key={player.id}>
            <StatsTD className="w-1 px-1 text-center text-xl">
              {index === 0 ? <span>🥇</span> : null}
              {index === 1 ? <span>🥈</span> : null}
              {index === 2 ? <span>🥉</span> : null}
            </StatsTD>
            <StatsTD>{player.name}</StatsTD>
            <StatsTD>{goalsScored}</StatsTD>
          </StatsTR>
        ))}
      </StatsTBody>
    </StatsTable>
  );
};
