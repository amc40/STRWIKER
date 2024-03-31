import React from 'react';
import { StatsTable } from '../stats-table/StatsTable';
import { StatsTHead } from '../stats-table/StatsTHead';
import { StatsTBody } from '../stats-table/StatsTBody';
import { StatsHeadTR } from '../stats-table/StatsHeadTR';
import { StatsTH } from '../stats-table/StatsTH';
import { StatsEngineFwoar } from '../../services/statsEngine';
import { StatsTR } from '../stats-table/StatsBodyTR';
import { StatsTD } from '../stats-table/StatsTD';

interface NumberOfGoalsScoredTableProps {
  gameId: number;
}

const statsEngine = new StatsEngineFwoar();

export const NumberOfGoalsScoredTable: React.FC<
  NumberOfGoalsScoredTableProps
> = async ({ gameId }) => {
  const playersAndNumberOfGoalsScored =
    await statsEngine.getNumberOfGoalsScoredByEachPlayerInGame(gameId);

  return (
    <StatsTable>
      <StatsTHead>
        <StatsHeadTR>
          <StatsTH>Player Name</StatsTH>
          <StatsTH>Goals Scored</StatsTH>
        </StatsHeadTR>
      </StatsTHead>
      <StatsTBody>
        {playersAndNumberOfGoalsScored.map(
          ({ playerId, player, goalsScored }) => (
            <StatsTR key={playerId}>
              <StatsTD>{player.name}</StatsTD>
              <StatsTD>{goalsScored}</StatsTD>
            </StatsTR>
          ),
        )}
      </StatsTBody>
    </StatsTable>
  );
};
