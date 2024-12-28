import React from 'react';
import { PlayerRankingTable } from '../components/game-stats/PlayerRankingTable';
import { getPlayersOrderedByDescendingElos } from '../repository/playerRepository';
import { StatsEngineFwoar } from '../services/statsEngine';

const statsEngine = new StatsEngineFwoar();

const Page: React.FC = async () => {
  const playersOrderedByDescendingElos =
    await getPlayersOrderedByDescendingElos();
  const playersOrderedByDescendingElosWithRanking =
    statsEngine.fromOrderedByStatAddRanking(
      playersOrderedByDescendingElos,
      ({ elo }) => elo,
    );

  return (
    <div className="w-screen flex flex-1 container mx-auto p-4">
      <div className="w-full">
        <PlayerRankingTable
          playersOrderedByDescendingElosWithRanking={[
            playersOrderedByDescendingElosWithRanking[0],
          ]}
        />
      </div>
    </div>
  );
};

export default Page;
