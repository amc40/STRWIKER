import { Game, PlayerPoint, Prisma, Team } from '@prisma/client';
import prisma from '../../lib/planetscale';
import { getPointFromPlayerPoint } from '../repository/pointRepository';
import { getAllPlayerPointsByPoint } from '../repository/playerPointRepository';

export class GameLogicService {
  startGame() {
    // TODO: set rotaty dependant on number of players
    prisma.game.create({
      data: { completed: false, rotatyBlue: true, rotatyRed: true }
    });
  }

  createPlayer(name: string) {
    prisma.player.create({ data: { name } });
  }

  async reorderPlayerPoint(
    reorderPlayerPoint: PlayerPoint,
    newPosition: number
  ) {
    const oldPosition = reorderPlayerPoint.position;
    if (newPosition > oldPosition) {
      // pushing it back
      const playerPoints = await prisma.playerPoint.findMany({
        where: {
          AND: [
            { position: { gt: oldPosition } },
            { position: { lte: newPosition } }
          ],
          pointId: reorderPlayerPoint.pointId,
          team: reorderPlayerPoint.team
        }
      });

      playerPoints.forEach((pp) => {
        prisma.playerPoint.update({
          where: {
            id: pp.id
          },
          data: {
            position: pp.position - 1
          }
        });
      });
    } else {
      // pulling it foward
      const playerPoints = await prisma.playerPoint.findMany({
        where: {
          AND: [
            { position: { lt: oldPosition } },
            { position: { gte: newPosition } }
          ],
          pointId: reorderPlayerPoint.pointId,
          team: reorderPlayerPoint.team
        }
      });

      playerPoints.forEach((pp) => {
        prisma.playerPoint.update({
          where: {
            id: pp.id
          },
          data: {
            position: pp.position + 1
          }
        });
      });
    }

    prisma.playerPoint.update({
      where: {
        id: reorderPlayerPoint.id
      },
      data: {
        position: newPosition
      }
    });
  }

  createPoint(currentRedScore: number, currentBlueScore: number, game: Game) {
    prisma.point.create({
      data: { currentRedScore, currentBlueScore, gameId: game.id }
    });
  }

  async scoreGoal(playerPoint: PlayerPoint, ownGoal: boolean) {
    prisma.playerPoint.update({
      where: {
        id: playerPoint.id
      },
      data: {
        scoredGoal: !ownGoal,
        ownGoal: ownGoal
      }
    });

    const scoringTeam = ownGoal
      ? playerPoint.team
      : opposingTeam(playerPoint.team);
    const finishedPoint = await getPointFromPlayerPoint(playerPoint);
    const newPoint = await prisma.point.create({
      data: {
        currentBlueScore:
          finishedPoint.currentBlueScore + (scoringTeam === Team.Blue ? 1 : 0),
        currentRedScore:
          finishedPoint.currentRedScore + (scoringTeam === Team.Red ? 1 : 0),
        gameId: finishedPoint.gameId
      }
    });
    const oldPlayerPoints = await getAllPlayerPointsByPoint(finishedPoint);

    const redPlayers = oldPlayerPoints.filter(
      (playerPoint) => playerPoint.team === Team.Red
    );
    const bluePlayers = oldPlayerPoints.filter(
      (playerPoint) => playerPoint.team === Team.Blue
    );

    const newPlayerPoints = await Promise.all(
      oldPlayerPoints.map(async (oldPlayerPoint) => {
        return await prisma.playerPoint.create({
          data: {
            playerId: playerPoint.playerId,
            pointId: newPoint.id,
            ownGoal: false,
            scoredGoal: false,
            rattled: false,
            team: playerPoint.team,
            position: getNextPlayerPosition(
              oldPlayerPoint.position,
              oldPlayerPoint.team == Team.Red
                ? redPlayers.length
                : bluePlayers.length
            )
          }
        });
      })
    );
  }

  async rotatePlayers(playerPoints: PlayerPoint[]) {
    playerPoints.sort((a, b) => a.position - b.position);
    this.reorderPlayerPoint(playerPoints[0], playerPoints.length - 1);
  }
}

function getNextPlayerPosition(
  previousPosition: number,
  numberOfPlayersOnTeam: number,
  isTeamRotating: boolean
) {
  if (!isTeamRotating) return previousPosition;
  const newPosition =
    previousPosition == 0 ? numberOfPlayersOnTeam - 1 : previousPosition - 1;
  return newPosition;
}

function isTeamRotating(team: Team, currentGame: Game) {
  return;
}

function opposingTeam(team: Team) {
  return team === Team.Red ? Team.Blue : Team.Red;
}
