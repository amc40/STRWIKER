import { $Enums, Player, PlayerPoint, Todo } from '@prisma/client';
import prisma from '../../../../lib/planetscale';
import fetchCurrentGame from '../../../../lib/fetchCurrentGame';

export interface PlayerPointWithPlayer extends PlayerPoint {
  player: Player;
}

export interface GameInfo {
  playerPoints: PlayerPointWithPlayer[];
  redScore: number;
  blueScore: number;
}

export const GET = async function handler(req: Request) {
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
  const gameInfo: GameInfo = {
    playerPoints: currentPointPlayers,
    redScore: currentPoint.currentRedScore,
    blueScore: currentPoint.currentBlueScore
  };
  return Response.json(gameInfo as GameInfo);
};
