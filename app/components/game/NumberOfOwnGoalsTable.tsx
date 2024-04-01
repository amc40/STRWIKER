import { Player } from '@prisma/client';
import React from 'react';
import { StatsTable } from '../stats-table/StatsTable';
import { StatsTHead } from '../stats-table/StatsTHead';
import { StatsHeadTR } from '../stats-table/StatsHeadTR';
import { StatsTH } from '../stats-table/StatsTH';
import { StatsTBody } from '../stats-table/StatsTBody';
import { StatsTR } from '../stats-table/StatsBodyTR';
import { StatsTD } from '../stats-table/StatsTD';

interface NumberOfOwnGoalsTableProps {
  playersAndNumberOfOwnGoals: {
    player: Player;
    ownGoals: number;
  }[];
}

export const NumberOfOwnGoalsTable: React.FC<NumberOfOwnGoalsTableProps> = ({
  playersAndNumberOfOwnGoals,
}) => {
  return (
    <StatsTable>
      <StatsTHead>
        <StatsHeadTR>
          <StatsTH>Player Name</StatsTH>
          <StatsTH>Own Goals</StatsTH>
        </StatsHeadTR>
      </StatsTHead>
      <StatsTBody>
        {playersAndNumberOfOwnGoals.length === 0 ? (
          <StatsTR>
            <StatsTD className="py-4 text-center" colSpan={2}>
              🎯 No own goals in this game
            </StatsTD>
          </StatsTR>
        ) : null}
        {playersAndNumberOfOwnGoals.map(({ player, ownGoals }) => (
          <StatsTR key={player.id}>
            <StatsTD>{player.name}</StatsTD>
            <StatsTD>{ownGoals}</StatsTD>
          </StatsTR>
        ))}
      </StatsTBody>
    </StatsTable>
  );
};
