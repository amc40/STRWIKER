import React from 'react';
import { PlayerRankingTable } from '../components/game-stats/PlayerRankingTable';
import {
  getPlayersOrderedByDescendingElos,
  getPlayersWithTotalGoals,
} from '../repository/playerRepository';
import { StatsEngineFwoar } from '../services/statsEngine';

const statsEngine = new StatsEngineFwoar();

const Page: React.FC = async () => {
  const [playersOrderedByDescendingElos, playersWithTotalGoals] = await Promise.all([
    getPlayersOrderedByDescendingElos(),
    getPlayersWithTotalGoals()
  ]);

  const playersOrderedByDescendingElosWithRanking =
    statsEngine.fromOrderedByStatAddRanking(
      playersOrderedByDescendingElos,
      ({ elo }) => elo,
    );

  const playerGoalsMap = new Map(
    playersWithTotalGoals.map(player => [player.id, player.totalGoals])
  );

  const playersWithRankingAndGoals = playersOrderedByDescendingElosWithRanking.map(player => ({
    ...player,
    totalGoals: playerGoalsMap.get(player.id) || 0
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
