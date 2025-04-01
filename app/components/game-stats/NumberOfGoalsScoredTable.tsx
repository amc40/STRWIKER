import React from 'react';
import { StatsTable } from '../stats-table/StatsTable';
import { StatsTHead } from '../stats-table/StatsTHead';
import { StatsTBody } from '../stats-table/StatsTBody';
import { StatsHeadTR } from '../stats-table/StatsHeadTR';
import { StatsTH } from '../stats-table/StatsTH';
import { StatsTR } from '../stats-table/StatsBodyTR';
import { StatsTD } from '../stats-table/StatsTD';
import { Player } from '@prisma/client';
import { EmojiMedalsTD } from '../stats-table/RankingTD';
import { WithRanking } from '../../services/statsEngine';

interface PlayersAndNumberOfGoalsScored {
  player: Player;
  goalsScored: number;
}

interface NumberOfGoalsScoredTableProps {
  playersAndNumberOfGoalsScoredWithRanking: WithRanking<PlayersAndNumberOfGoalsScored>[];
}

export const NumberOfGoalsScoredTable: React.FC<
  NumberOfGoalsScoredTableProps
> = ({ playersAndNumberOfGoalsScoredWithRanking }) => {
  // Find the highest number of goals
  const maxGoals = Math.max(
    ...playersAndNumberOfGoalsScoredWithRanking.map(p => p.goalsScored),
    0
  );

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
        {playersAndNumberOfGoalsScoredWithRanking.length === 0 ? (
          <StatsTR>
            <StatsTD className="py-4 text-center" colSpan={3}>
              🤔 No goals in this game
            </StatsTD>
          </StatsTR>
        ) : null}
        {playersAndNumberOfGoalsScoredWithRanking.map(
          ({ player, goalsScored, ranking }) => (
            <StatsTR key={player.id}>
              <EmojiMedalsTD ranking={ranking} />
              <StatsTD>
                {player.name}
              </StatsTD>
              <StatsTD>{goalsScored}</StatsTD>
            </StatsTR>
          ),
        )}
      </StatsTBody>
    </StatsTable>
  );
};
