import React from 'react';
import { NumberOfGoalsScoredTable } from '../../../components/game-stats/NumberOfGoalsScoredTable';
import { notFound } from 'next/navigation';
import { doesGameIdExist } from '../../../repository/gameRepository';
import { StatsSwiper } from '../../../components/stats-swiper/StatsSwiper';
import { StatsEngineFwoar } from '../../../services/statsEngine';
import { NumberOfOwnGoalsTable } from '../../../components/game-stats/NumberOfOwnGoalsTable';
import { PlayerRankingTable } from '../../../components/game-stats/PlayerRankingTable';
import { LongestPointsTable } from '../../../components/game-stats/LongestPointsTable';
import { GameLogicService } from '../../../services/gameLogicService';

interface GameServerParams {
  gameId: string;
}

interface GameServerProps {
  params: GameServerParams;
}

const statsEngine = new StatsEngineFwoar();
const gameLogicService = new GameLogicService();

const NUMBER_OF_LONGEST_POINTS_TO_DISPLAY = 5;

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
  const playersAndNumberOfGoalsScoredWithRanking =
    statsEngine.fromOrderedByStatAddRanking(
      playersAndNumberOfGoalsScored,
      ({ goalsScored }) => goalsScored,
    );

  const playersAndNumberOfOwnGoals =
    await statsEngine.getNumberOfOwnGoalsScoredByEachPlayerInGame(gameId);

  const longestPoints = await statsEngine.getLongestPointsInGame(
    gameId,
    NUMBER_OF_LONGEST_POINTS_TO_DISPLAY,
  );
  const longestPointsWithActivePlayers = await Promise.all(
    longestPoints.map(
      async (pointAndDuration) =>
        await gameLogicService.joinPointWithActivePlayers(pointAndDuration),
    ),
  );

  const playersOrderedByDescendingElosWithChange =
    await statsEngine.getPlayersOrderedByEloWithChangeSinceLastGame(gameId);

  const playersOrderedByDescendingElosWithRanking =
    statsEngine.fromOrderedByStatAddRanking(
      playersOrderedByDescendingElosWithChange,
      ({ elo }) => elo,
    );

  return (
    <div className="w-screen flex flex-1 container mx-auto p-4">
      <StatsSwiper>
        <NumberOfGoalsScoredTable
          playersAndNumberOfGoalsScoredWithRanking={
            playersAndNumberOfGoalsScoredWithRanking
          }
        />
        <NumberOfOwnGoalsTable
          playersAndNumberOfOwnGoals={playersAndNumberOfOwnGoals}
        />
        <LongestPointsTable
          longestPointsWithActivePlayers={longestPointsWithActivePlayers}
        />
        <PlayerRankingTable
          playersOrderedByDescendingElosWithRanking={
            playersOrderedByDescendingElosWithRanking
          }
          onlyShowChanges
        />
      </StatsSwiper>
    </div>
  );
};

export default GameServer;
