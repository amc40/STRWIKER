import { Player } from '@prisma/client';
import React from 'react';
import { StatsTable } from '../stats-table/StatsTable';
import { StatsTR } from '../stats-table/StatsBodyTR';
import { StatsHeadTR } from '../stats-table/StatsHeadTR';
import { StatsTBody } from '../stats-table/StatsTBody';
import { StatsTD } from '../stats-table/StatsTD';
import { StatsTH } from '../stats-table/StatsTH';
import { StatsTHead } from '../stats-table/StatsTHead';
import { EmojiMedalsTD } from '../stats-table/RankingTD';
import { WithRanking } from '../../services/statsEngine';

interface PlayerRankingTableProps {
  playersOrderedByDescendingElosWithRanking: WithRanking<Player>[];
}

export const PlayerRankingTable: React.FC<PlayerRankingTableProps> = ({
  playersOrderedByDescendingElosWithRanking: playersOrderedByDescendingElos,
}) => {
  return (
    <StatsTable>
      <StatsTHead>
        <StatsHeadTR>
          <StatsTH></StatsTH>
          <StatsTH>Player Name</StatsTH>
          <StatsTH>Elo</StatsTH>
        </StatsHeadTR>
      </StatsTHead>
      <StatsTBody>
        {playersOrderedByDescendingElos.map(({ id, name, elo, ranking }) => (
          <StatsTR key={id}>
            <EmojiMedalsTD ranking={ranking} />
            <StatsTD>{name}</StatsTD>
            <StatsTD>{elo}</StatsTD>
          </StatsTR>
        ))}
      </StatsTBody>
    </StatsTable>
  );
};
