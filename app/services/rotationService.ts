import { Game, PlayerPoint, Team } from '@prisma/client';
import prisma from '../../lib/planetscale';

export class RotationService {
  async reorderPlayerPoint(
    playerPointToReorder: PlayerPoint,
    newPosition: number
  ) {
    const oldPosition = playerPointToReorder.position;
    await prisma.$transaction(async () => {
      if (newPosition > oldPosition) {
        // pushing it back
        const playerPoints = await prisma.playerPoint.findMany({
          where: {
            AND: [
              { position: { gt: oldPosition } },
              { position: { lte: newPosition } }
            ],
            pointId: playerPointToReorder.pointId,
            team: playerPointToReorder.team
          }
        });

        await prisma.playerPoint.updateMany({
          where: {
            id: {
              in: playerPoints.map((playerPoint) => playerPoint.id)
            }
          },
          data: {
            position: {
              decrement: 1
            }
          }
        });
      } else {
        // pulling it foward
        const playerPoints = await prisma.playerPoint.findMany({
          where: {
            AND: [
              { position: { lt: oldPosition } },
              { position: { gte: newPosition } }
            ],
            pointId: playerPointToReorder.pointId,
            team: playerPointToReorder.team
          }
        });

        await prisma.playerPoint.updateMany({
          where: {
            id: {
              in: playerPoints.map((playerPoint) => playerPoint.id)
            }
          },
          data: {
            position: {
              increment: 1
            }
          }
        });
      }

      await prisma.playerPoint.update({
        where: {
          id: playerPointToReorder.id
        },
        data: {
          position: newPosition
        }
      });
    });
  }

  async rotatePlayerPoints(playerPoints: PlayerPoint[]) {
    playerPoints.sort((a, b) => a.position - b.position);
    this.reorderPlayerPoint(playerPoints[0], playerPoints.length - 1);
  }

  getNextPlayerPosition(
    previousPosition: number,
    numberOfPlayersOnTeam: number,
    isTeamRotating: boolean
  ) {
    if (!isTeamRotating) return previousPosition;
    const newPosition =
      previousPosition === 0 ? numberOfPlayersOnTeam - 1 : previousPosition - 1;
    return newPosition;
  }

  isTeamRotating(team: Team, game: Game, scoringTeam: Team) {
    const rotationStrategy = this.getTeamRotationStrategyInGame(team, game);
    switch (rotationStrategy) {
      case 'Never':
        return false;
      case 'Always':
        return true;
      case 'OnConcede':
        return team !== scoringTeam;
    }
  }

  getTeamRotationStrategyInGame(team: Team, game: Game) {
    switch (team) {
      case 'Red':
        return game.rotatyRed;
      case 'Blue':
        return game.rotatyBlue;
    }
  }
}
