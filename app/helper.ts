'use server';
import { Game, Player, PlayerPoint, Point } from '@prisma/client';
import prisma from '../lib/planetscale';

export async function getCurrentGame(): Promise<{
  game: Game | null;
  point:
    | (Point & {
        playerPoints: (PlayerPoint & { player: Player })[];
      })
    | null;
}> {
  console.log('checking for open game');
  const currentGame = await prisma.game.findFirst({
    where: {
      completed: false
    }
  });

  let currentPoint = null;

  if (currentGame?.currentPointId) {
    currentPoint = await prisma.point.findUnique({
      where: {
        id: currentGame.currentPointId
      },
      select: {
        id: true,
        playerPoints: {
          select: {
            id: true,
            player: {
              select: {
                name: true,
                id: true
              }
            },
            position: true,
            team: true,
            scoredGoal: true,
            ownGoal: true,
            rattled: true,
            playerId: true,
            pointId: true
          }
        },
        currentRedScore: true,
        currentBlueScore: true,
        startTime: true,
        endTime: true,
        gameId: true
      }
    });
  }

  return { game: currentGame, point: currentPoint };
}

export async function startGame() {
  console.log('starting game :)');
  prisma.game.create({
    data: {
      completed: false
    }
  });
  return;
}
