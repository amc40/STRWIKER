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
  previousElo?: number | null;
};

type MaybeWithChangeInRanking<T> = T & {
  changeInRanking?: number | null;
};

interface PlayerRankingTableProps {
  playersOrderedByDescendingElosWithRanking: MaybeWithChangeInRanking<
    WithRanking<PlayerMaybeWithChangeInElo>
  >[];
  onlyShowChanges?: boolean;
}

export const PlayerRankingTable: React.FC<PlayerRankingTableProps> = ({
  playersOrderedByDescendingElosWithRanking: playersOrderedByDescendingElos,
  onlyShowChanges = false,
}) => {
  const hasEloOrRankingChanged = (
    changeInElo?: number | null,
    changeInRanking?: number | null,
  ) => {
    return [changeInElo, changeInRanking].some(
      (change) => change != null && change !== 0,
    );
  };

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
          ({
            id,
            name,
            elo,
            previousElo,
            changeInElo,
            ranking,
            changeInRanking,
          }) => {
            if (
              onlyShowChanges &&
              !hasEloOrRankingChanged(changeInElo, changeInRanking) &&
              // workaround for players who don't have an elo
              previousElo != null
            ) {
              return null;
            }
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
