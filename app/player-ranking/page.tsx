import React from 'react';
import { PlayerRankingTable } from '../components/game-stats/PlayerRankingTable';
import {
  getPlayersOrderedByDescendingElos,
  getPlayersWithTotalGoals,
  getPlayersInLongestPoint,
  getPlayersWhoLost10_0,
} from '../repository/playerRepository';
import { StatsEngineFwoar } from '../services/statsEngine';

const statsEngine = new StatsEngineFwoar();

const Page: React.FC = async () => {
  const [
    playersOrderedByDescendingElos, 
    playersWithTotalGoals,
    playersInLongestPoint,
    playersWhoLost10_0
  ] = await Promise.all([
    getPlayersOrderedByDescendingElos(),
    getPlayersWithTotalGoals(),
    getPlayersInLongestPoint(),
    getPlayersWhoLost10_0()
  ]);

  const playersOrderedByDescendingElosWithRanking =
    statsEngine.fromOrderedByStatAddRanking(
      playersOrderedByDescendingElos,
      ({ elo }) => elo,
    );

  const playerGoalsMap = new Map(
    playersWithTotalGoals.map(player => [player.id, player.totalGoals])
  );

  const longestPointPlayersSet = new Set(
    playersInLongestPoint.map(player => player.id)
  );

  const spectatorPlayersSet = new Set(
    playersWhoLost10_0.map(player => player.id)
  );

  const playersWithRankingAndGoals = playersOrderedByDescendingElosWithRanking.map(player => ({
    ...player,
    totalGoals: playerGoalsMap.get(player.id) || 0,
    inLongestPoint: longestPointPlayersSet.has(player.id),
    isSpectator: spectatorPlayersSet.has(player.id)
  }));

  const maxGoals = Math.max(...playersWithRankingAndGoals.map(p => p.totalGoals));

  return (
    <div className="w-screen flex flex-1 container mx-auto p-4">
      <div className="w-full">
        <PlayerRankingTable
          playersOrderedByDescendingElosWithRanking={playersWithRankingAndGoals}
          maxGoals={maxGoals}
        />
      </div>
    </div>
  );
};

export default Page;
