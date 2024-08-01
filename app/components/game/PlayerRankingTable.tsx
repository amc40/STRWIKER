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
import { ChangeInValue } from '../ChangeInValue';
import { PlayerWithoutStatValues } from '../../repository/playerRepository';

type PlayerMaybeWithChangeInElo = PlayerWithoutStatValues & {
  elo: number;
  changeInElo?: number | null;
};

type MaybeWithChangeInRanking<T> = T & {
  changeInRanking?: number | null;
};

interface PlayerRankingTableProps {
  playersOrderedByDescendingElosWithRanking: MaybeWithChangeInRanking<
    WithRanking<PlayerMaybeWithChangeInElo>
  >[];
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
        {playersOrderedByDescendingElos.map(
          ({ id, name, elo, changeInElo, ranking, changeInRanking }) => {
            return (
              <StatsTR key={id}>
                <EmojiMedalsTD
                  ranking={ranking}
                  changeInRanking={changeInRanking}
                />
                <StatsTD>{name}</StatsTD>
                <StatsTD>
                  <span>{elo}</span>
                  {changeInElo != null ? (
                    <ChangeInValue changeInValue={changeInElo} />
                  ) : null}
                </StatsTD>
              </StatsTR>
            );
          },
        )}
      </StatsTBody>
    </StatsTable>
  );
};
