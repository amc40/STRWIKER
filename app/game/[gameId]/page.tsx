import React from 'react';
import { NumberOfGoalsScoredTable } from '../../components/game/NumberOfGoalsScoredTable';
import { notFound } from 'next/navigation';
import {
  doesGameIdExist,
  getAllNotInProgressGameIds,
} from '../../repository/gameRepository';

interface GameServerParams {
  gameId: string;
}

interface GameServerProps {
  params: GameServerParams;
}

const GameServer: React.FC<GameServerProps> = async ({ params }) => {
  const { gameId: gameIdString } = params;
  // TODO: add error handling - should return a 404
  const gameId = Number.parseInt(gameIdString);

  if (isNaN(gameId)) {
    notFound();
  }

  if (!(await doesGameIdExist(gameId))) {
    notFound();
  }

  return <NumberOfGoalsScoredTable gameId={gameId} />;
};

export async function generateStaticParams(): Promise<GameServerParams[]> {
  const gameIds = await getAllNotInProgressGameIds();
  return gameIds.map((gameId) => ({
    gameId: gameId.toString(),
  }));
}

export default GameServer;
