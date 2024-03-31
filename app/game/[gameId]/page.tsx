import React from 'react';
import { NumberOfGoalsScoredTable } from '../../components/game/NumberOfGoalsScoredTable';
import { notFound } from 'next/navigation';
import { doesGameIdExist } from '../../repository/gameRepository';
import { StatsSwiper } from '../../components/stats-swiper/StatsSwiper';
import { StatsEngineFwoar } from '../../services/statsEngine';
import { NumberOfOwnGoalsTable } from '../../components/game/NumberOfOwnGoalsTable';

interface GameServerParams {
  gameId: string;
}

interface GameServerProps {
  params: GameServerParams;
}

const statsEngine = new StatsEngineFwoar();

const GameServer: React.FC<GameServerProps> = async ({ params }) => {
  const { gameId: gameIdString } = params;
  const gameId = Number.parseInt(gameIdString);

  if (isNaN(gameId)) {
    notFound();
  }

  if (!(await doesGameIdExist(gameId))) {
    notFound();
  }

  // Ideally this data would be fetched inside each of the tables, but at time of writing there was a bug in
  //  Next.js where async Server Components could not be passed as children of Client components
  const playersAndNumberOfGoalsScored =
    await statsEngine.getNumberOfGoalsScoredByEachPlayerInGame(gameId);

  const playersAndNumberOfOwnGoals =
    await statsEngine.getNumberOfOwnGoalsScoredByEachPlayerInGame(gameId);

  return (
    <div className="w-screen flex flex-1 container mx-auto p-4">
      <StatsSwiper>
        <NumberOfGoalsScoredTable
          playersAndNumberOfGoalsScored={playersAndNumberOfGoalsScored}
        />
        <NumberOfOwnGoalsTable
          playersAndNumberOfOwnGoals={playersAndNumberOfOwnGoals}
        />
      </StatsSwiper>
    </div>
  );
};

export default GameServer;
