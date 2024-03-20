import { Game, PlayerPoint, Team } from '@prisma/client';
import prisma from '../../lib/planetscale';
import {
  decrementPlayerPointPositions,
  getPlayerPointsInPositionRangeForTeam,
  incrementPlayerPointPositions,
  setPlayerPointPosition
} from '../repository/playerPointRepository';

export class PlayerPointPositionService {
  async reorderPlayerPoint(
    playerPointToReorder: PlayerPoint,
    newPosition: number
  ) {
    const oldPosition = playerPointToReorder.position;
    await prisma.$transaction(async () => {
      if (newPosition > oldPosition) {
        await this.pushPlayerPointBack(
          playerPointToReorder,
          newPosition,
          oldPosition
        );
      } else {
        await this.pullPlayerPointForward(
          playerPointToReorder,
          newPosition,
          oldPosition
        );
      }
    });
  }

  private async pushPlayerPointBack(
    playerPointToPushBack: PlayerPoint,
    newPosition: number,
    oldPosition: number
  ) {
    const { pointId, team } = playerPointToPushBack;
    const otherPlayerPointsToPullForward =
      await getPlayerPointsInPositionRangeForTeam(
        pointId,
        team,
        oldPosition + 1,
        newPosition + 1
      );

    await decrementPlayerPointPositions(otherPlayerPointsToPullForward);

    await setPlayerPointPosition(playerPointToPushBack, newPosition);
  }

  private async pullPlayerPointForward(
    playerPointToPullForward: PlayerPoint,
    newPosition: number,
    oldPosition: number
  ) {
    const { pointId, team } = playerPointToPullForward;
    const otherPlayerPointsToPushBack =
      await getPlayerPointsInPositionRangeForTeam(
        pointId,
        team,
        newPosition,
        oldPosition
      );

    await incrementPlayerPointPositions(otherPlayerPointsToPushBack);

    await setPlayerPointPosition(playerPointToPullForward, newPosition);
  }

  async rotatePlayerPoints(playerPoints: PlayerPoint[]) {
    playerPoints.sort((a, b) => a.position - b.position);
    this.reorderPlayerPoint(playerPoints[0], playerPoints.length - 1);
  }

  getNextPlayerPositionForTeam(
    previousPosition: number,
    playerTeam: Team,
    numberOfPlayersForTeam: Record<Team, number>,
    scoringTeam: Team,
    game: Game
  ) {
    return this.getNextPlayerPosition(
      previousPosition,
      numberOfPlayersForTeam[playerTeam],
      this.isTeamRotating(playerTeam, game, scoringTeam)
    );
  }

  private getNextPlayerPosition(
    previousPosition: number,
    numberOfPlayersOnTeam: number,
    isTeamRotating: boolean
  ) {
    if (!isTeamRotating) return previousPosition;
    const newPosition =
      previousPosition === 0 ? numberOfPlayersOnTeam - 1 : previousPosition - 1;
    return newPosition;
  }

  private isTeamRotating(team: Team, game: Game, scoringTeam: Team) {
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

  private getTeamRotationStrategyInGame(team: Team, game: Game) {
    switch (team) {
      case 'Red':
        return game.rotatyRed;
      case 'Blue':
        return game.rotatyBlue;
    }
  }
}
