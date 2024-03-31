import React, { Suspense } from 'react';
import { NumberOfGoalsScoredTable } from '../../components/game/NumberOfGoalsScoredTable';
import { notFound } from 'next/navigation';
import {
  doesGameIdExist,
  getAllNotInProgressGameIds,
} from '../../repository/gameRepository';
import { StatsSwiper } from '../../components/stats-swiper/StatsSwiper';
import { SwiperSlide } from 'swiper/react';
import { StatsSwiperSlide } from '../../components/stats-swiper/StatsSwiperSlide';
import { StatsEngineFwoar } from '../../services/statsEngine';

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

  return (
    <div className="w-screen">
      <StatsSwiper>
        <StatsSwiperSlide>
          <NumberOfGoalsScoredTable
            playersAndNumberOfGoalsScored={playersAndNumberOfGoalsScored}
          />
        </StatsSwiperSlide>
        <StatsSwiperSlide>
          <NumberOfGoalsScoredTable
            playersAndNumberOfGoalsScored={playersAndNumberOfGoalsScored}
          />
        </StatsSwiperSlide>
      </StatsSwiper>
    </div>
  );
};

export default GameServer;
