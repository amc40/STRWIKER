'use server'

import { getApiUrl } from '../app/api/helpers';
import { GameInfo } from '../app/api/current-game/info/route';
import fetchCurrentGame from './fetchCurrentGame';
import prisma from './planetscale';

export default async function fetchCurrentGameInfo(): Promise<GameInfo> {
  const currentGame = await fetchCurrentGame();
  const currentPoint = await prisma.point.findFirst({
    where: {
      gameId: currentGame.id
    },
    orderBy: {
      startTime: 'desc'
    }
  });
  if (!currentPoint) {
    throw new Error('current point not found');
  }
  const currentPointPlayers = await prisma.playerPoint.findMany({
    where: {
      pointId: currentGame.id
    },
    include: {
      player: true
    }
  });
  return {
    playerPoints: currentPointPlayers,
    redScore: currentPoint.currentRedScore,
    blueScore: currentPoint.currentBlueScore
  };
}
