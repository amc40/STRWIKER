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
          <StatsTH>Player Name</StatsTH>
          <StatsTH>Goals Scored</StatsTH>
        </StatsHeadTR>
      </StatsTHead>
      <StatsTBody>
        {playersAndNumberOfGoalsScored.length === 0 ? (
          <StatsTR>
            <StatsTD className="text-center" colSpan={2}>
              🤔 No goals in this game
            </StatsTD>
          </StatsTR>
        ) : null}
        {playersAndNumberOfGoalsScored.map(({ player, goalsScored }) => (
          <StatsTR key={player.id}>
            <StatsTD>{player.name}</StatsTD>
            <StatsTD>{goalsScored}</StatsTD>
          </StatsTR>
        ))}
      </StatsTBody>
    </StatsTable>
  );
};
