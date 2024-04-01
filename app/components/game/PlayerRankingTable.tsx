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

interface PlayerRankingTableProps {
  playersOrderedByDescendingElos: Player[];
}

export const PlayerRankingTable: React.FC<PlayerRankingTableProps> = ({
  playersOrderedByDescendingElos,
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
        {playersOrderedByDescendingElos.map(({ id, name, elo }, index) => (
          <StatsTR key={id}>
            <EmojiMedalsTD index={index} />
            <StatsTD>{name}</StatsTD>
            <StatsTD>{elo}</StatsTD>
          </StatsTR>
        ))}
      </StatsTBody>
    </StatsTable>
  );
};
