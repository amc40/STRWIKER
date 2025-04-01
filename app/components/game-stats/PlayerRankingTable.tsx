import React from 'react';
import { StatsTable } from '../stats-table/StatsTable';
import { StatsTR } from '../stats-table/StatsBodyTR';
import { StatsHeadTR } from '../stats-table/StatsHeadTR';
import { StatsTBody } from '../stats-table/StatsTBody';
import { StatsTD } from '../stats-table/StatsTD';
import { StatsTH } from '../stats-table/StatsTH';
import { StatsTHead } from '../stats-table/StatsTHead';
import { EmojiMedalsTD } from '../stats-table/RankingTD';
import { TopScorerBadge } from '../stats-table/TopScorerBadge';
import { LongestPointBadge } from '../stats-table/LongestPointBadge';
import { SpectatorBadge } from '../stats-table/SpectatorBadge';
import { OopsBadge } from '../stats-table/OopsBadge';
import { WithRanking } from '../../services/statsEngine';
import { ChangeInValue } from '../ChangeInValue';
import { PlayerWithoutStatValues } from '../../repository/playerRepository';

type PlayerMaybeWithChangeInElo = PlayerWithoutStatValues & {
  elo: number;
  changeInElo?: number | null;
  previousElo?: number | null;
  totalGoals: number;
  inLongestPoint: boolean;
  isSpectator: boolean;
  hasMostOwnGoals: boolean;
};

type MaybeWithChangeInRanking<T> = T & {
  changeInRanking?: number | null;
};

type PlayerRankingInfo = MaybeWithChangeInRanking<
  WithRanking<PlayerMaybeWithChangeInElo>
>;

interface PlayerRankingTableProps {
  playersOrderedByDescendingElosWithRanking: PlayerRankingInfo[];
  onlyShowChanges?: boolean;
  maxGoals?: number;
}

type RowToDisplay =
  | {
      type: 'truncation';
    }
  | {
      type: 'playerRanking';
      playerRankingInfo: PlayerRankingInfo;
    };

export const PlayerRankingTable: React.FC<PlayerRankingTableProps> = ({
  playersOrderedByDescendingElosWithRanking,
  onlyShowChanges = false,
  maxGoals = 0,
}) => {
  const hasEloOrRankingChanged = (
    changeInElo?: number | null,
    changeInRanking?: number | null,
  ) => {
    return [changeInElo, changeInRanking].some(
      (change) => change != null && change !== 0,
    );
  };

  const playerRankingInfoToRowToDisplay = (
    playerRankingInfo: PlayerRankingInfo,
  ): RowToDisplay => ({
    type: 'playerRanking',
    playerRankingInfo,
  });

  const rowsToDisplay: RowToDisplay[] = onlyShowChanges
    ? playersOrderedByDescendingElosWithRanking.reduce<RowToDisplay[]>(
        (accumulatingArray, playerRankingInfo) => {
          const { changeInElo, previousElo, changeInRanking } =
            playerRankingInfo;
          const shouldShowPlayer =
            hasEloOrRankingChanged(changeInElo, changeInRanking) ||
            // workaround for players who don't have an elo
            previousElo == null;
          if (shouldShowPlayer) {
            accumulatingArray.push(
              playerRankingInfoToRowToDisplay(playerRankingInfo),
            );
            return accumulatingArray;
          }
          const previousRowIsTruncation =
            accumulatingArray.length > 0 &&
            accumulatingArray[accumulatingArray.length - 1].type ===
              'truncation';
          if (previousRowIsTruncation) {
            return accumulatingArray;
          }
          accumulatingArray.push({
            type: 'truncation',
          });
          return accumulatingArray;
        },
        [],
      )
    : playersOrderedByDescendingElosWithRanking.map(
        playerRankingInfoToRowToDisplay,
      );

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
        {rowsToDisplay.map((rowToDisplay, index) => {
          const { type } = rowToDisplay;
          if (type === 'truncation') {
            return (
              <StatsTR key={`truncation-${index.toFixed()}`}>
                <StatsTD
                  className="text-center text-lg font-semibold"
                  colSpan={3}
                >
                  ...
                </StatsTD>
              </StatsTR>
            );
          }
          const { id, ranking, changeInRanking, name, elo, changeInElo, totalGoals, inLongestPoint, isSpectator, hasMostOwnGoals } =
            rowToDisplay.playerRankingInfo;
          return (
            <StatsTR key={id}>
              <EmojiMedalsTD
                ranking={ranking}
                changeInRanking={changeInRanking}
              />
              <StatsTD>
                {name}
                {totalGoals === maxGoals && maxGoals > 0 && <TopScorerBadge />}
                {inLongestPoint && <LongestPointBadge />}
                {isSpectator && <SpectatorBadge />}
                {hasMostOwnGoals && <OopsBadge />}
              </StatsTD>
              <StatsTD>
                <div className="flex gap-1">
                  <span>{elo}</span>
                  {changeInElo != null ? (
                    <ChangeInValue changeInValue={changeInElo} />
                  ) : null}
                </div>
              </StatsTD>
            </StatsTR>
          );
        })}
      </StatsTBody>
    </StatsTable>
  );
};
