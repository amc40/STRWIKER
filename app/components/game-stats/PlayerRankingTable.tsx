import React from 'react';
import { StatsTable } from '../stats-table/StatsTable';
import { StatsTR } from '../stats-table/StatsBodyTR';
import { StatsTD } from '../stats-table/StatsTD';
import { StatsTHead } from '../stats-table/StatsTHead';
import { StatsTH } from '../stats-table/StatsTH';
import { StatsTBody } from '../stats-table/StatsTBody';
import { StatsHeadTR } from '../stats-table/StatsHeadTR';
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

type PlayerRankingInfo = WithRanking<PlayerMaybeWithChangeInElo> & {
  changeInRanking?: number | null;
};

interface PlayerRankingTableProps {
  playersOrderedByDescendingElosWithRanking: PlayerRankingInfo[];
  onlyShowChanges?: boolean;
  maxGoals?: number;
}

export const PlayerRankingTable: React.FC<PlayerRankingTableProps> = ({
  playersOrderedByDescendingElosWithRanking,
  onlyShowChanges = false,
  maxGoals = 0,
}) => {
  const rowsToDisplay = playersOrderedByDescendingElosWithRanking.map(
    (playerRankingInfo) => ({
      playerRankingInfo,
      shouldDisplay: !onlyShowChanges || playerRankingInfo.changeInElo != null,
    }),
  );

  return (
    <StatsTable>
      <StatsTHead>
        <StatsHeadTR>
          <StatsTH>Rank</StatsTH>
          <StatsTH>Name</StatsTH>
          <StatsTH>Elo</StatsTH>
        </StatsHeadTR>
      </StatsTHead>
      <StatsTBody>
        {rowsToDisplay.map((rowToDisplay) => {
          if (!rowToDisplay.shouldDisplay) {
            return null;
          }
          const {
            id,
            ranking,
            changeInRanking,
            name,
            elo,
            changeInElo,
            totalGoals,
            inLongestPoint,
            isSpectator,
            hasMostOwnGoals,
          } = rowToDisplay.playerRankingInfo;
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
