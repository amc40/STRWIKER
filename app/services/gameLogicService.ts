import { Game, PlayerPoint, Point, Prisma, Team } from '@prisma/client';
import prisma from '../../lib/planetscale';
import { getPointFromPlayerPoint } from '../repository/pointRepository';
import { getAllPlayerPointsByPoint } from '../repository/playerPointRepository';

export class GameLogicService {
  startGame() {
    // TODO: set rotaty dependant on number of players
    prisma.game.create({
      data: { completed: false, rotatyBlue: 'Always', rotatyRed: 'Always' }
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

  async scoreGoal(
    scorerPlayerPoint: PlayerPoint,
    ownGoal: boolean,
    finishedPoint: Point,
    game: Game
  ) {
    await prisma.playerPoint.update({
      where: {
        id: scorerPlayerPoint.id
      },
      data: {
        scoredGoal: !ownGoal,
        ownGoal: ownGoal
      }
    });

    await prisma.point.update({
      where: {
        id: finishedPoint.id
      },
      data: {
        endTime: new Date()
      }
    });

    const scoringTeam = ownGoal
      ? scorerPlayerPoint.team
      : opposingTeam(scorerPlayerPoint.team);

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

    const newPlayerPointsToCreate = oldPlayerPoints.map((oldPlayerPoint) => ({
      playerId: oldPlayerPoint.playerId,
      pointId: newPoint.id,
      ownGoal: false,
      scoredGoal: false,
      rattled: false,
      team: oldPlayerPoint.team,
      position: getNextPlayerPosition(
        oldPlayerPoint.position,
        oldPlayerPoint.team == Team.Red
          ? redPlayers.length
          : bluePlayers.length,
        isTeamRotating(oldPlayerPoint.team, game, scoringTeam)
      )
    }));

    await prisma.playerPoint.createMany({
      data: newPlayerPointsToCreate
    });

    await prisma.game.update({
      where: {
        id: game.id
      },
      data: {
        currentPointId: newPoint.id
      }
    });
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
    previousPosition === 0 ? numberOfPlayersOnTeam - 1 : previousPosition - 1;
  return newPosition;
}

function isTeamRotating(team: Team, game: Game, scoringTeam: Team) {
  const rotationStrategy = getTeamRotationStrategyInGame(team, game);
  switch (rotationStrategy) {
    case 'Never':
      return false;
    case 'Always':
      return true;
    case 'OnLose':
      return team !== scoringTeam;
  }
}

function getTeamRotationStrategyInGame(team: Team, game: Game) {
  switch (team) {
    case 'Red':
      return game.rotatyRed;
    case 'Blue':
      return game.rotatyBlue;
  }
}

function opposingTeam(team: Team) {
  return team === Team.Red ? Team.Blue : Team.Red;
}
