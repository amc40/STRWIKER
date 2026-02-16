import {
  Game,
  PlayerPoint,
  Point,
  RotatyStrategy,
  StrikerPosition,
  Team,
} from '@prisma/client';
import prisma from '../../lib/planetscale';
import {
  decrementPlayerPointPositions,
  getCurrentPlayerPointForPlayerOrThrow,
  getMaxPlayerPointPositionForTeamInPoint,
  getPlayerPointsInPositionRangeForTeam,
  incrementPlayerPointPositions,
  setPlayerPointPosition,
} from '../repository/playerPointRepository';
import {
  getCurrentGameOrThrow,
  updateRotatyStrategyForTeamAndGameId,
} from '../repository/gameRepository';

export interface RotationResult {
  positionsByPlayerId: Map<number, number>;
  playerIdsToUnskip: Set<number>;
}

export interface StrikerDefenderFlags {
  isStriker: boolean;
  isDefender: boolean;
}

export class PlayerPointPositionService {
  static ACTIVE_PLAYER_MAX_POSITION = 2;

  async reorderPlayerInCurrentGame(playerId: number, newPosition: number) {
    const playerPoint = await getCurrentPlayerPointForPlayerOrThrow(playerId);
    return this.reorderPlayerPoint(playerPoint, newPosition);
  }

  private async reorderPlayerPoint(
    playerPointToReorder: PlayerPoint,
    newPosition: number,
  ) {
    const oldPosition = playerPointToReorder.position;
    await prisma.$transaction(async () => {
      if (newPosition > oldPosition) {
        await this.pushPlayerPointBack(
          playerPointToReorder,
          newPosition,
          oldPosition,
        );
      } else {
        await this.pullPlayerPointForward(
          playerPointToReorder,
          newPosition,
          oldPosition,
        );
      }
    });
  }

  private async pushPlayerPointBack(
    playerPointToPushBack: PlayerPoint,
    newPosition: number,
    oldPosition: number,
  ) {
    const { pointId, team } = playerPointToPushBack;
    const otherPlayerPointsToPullForward =
      await getPlayerPointsInPositionRangeForTeam(
        pointId,
        team,
        oldPosition + 1,
        newPosition + 1,
      );

    await decrementPlayerPointPositions(otherPlayerPointsToPullForward);

    await setPlayerPointPosition(playerPointToPushBack, newPosition);
  }

  private async pullPlayerPointForward(
    playerPointToPullForward: PlayerPoint,
    newPosition: number,
    oldPosition: number,
  ) {
    const { pointId, team } = playerPointToPullForward;
    const otherPlayerPointsToPushBack =
      await getPlayerPointsInPositionRangeForTeam(
        pointId,
        team,
        newPosition,
        oldPosition,
      );

    await incrementPlayerPointPositions(otherPlayerPointsToPushBack);

    await setPlayerPointPosition(playerPointToPullForward, newPosition);
  }

  async rotatePlayerPoints(playerPoints: PlayerPoint[]) {
    playerPoints.sort((a, b) => a.position - b.position);
    await this.reorderPlayerPoint(playerPoints[0], playerPoints.length - 1);
  }

  getNextPlayerPositionForTeamWithRotatyStrategy(
    previousPosition: number,
    playerTeam: Team,
    numberOfPlayersForTeam: Record<Team, number>,
    scoringTeam: Team,
    rotatyStrategy: RotatyStrategy,
  ) {
    return this.getNextPlayerPosition(
      previousPosition,
      numberOfPlayersForTeam[playerTeam],
      this.isTeamRotating(playerTeam, rotatyStrategy, scoringTeam),
    );
  }

  getNextPlayerPositionForTeamInGame(
    previousPosition: number,
    playerTeam: Team,
    numberOfPlayersForTeam: Record<Team, number>,
    scoringTeam: Team,
    game: Game,
  ) {
    return this.getNextPlayerPosition(
      previousPosition,
      numberOfPlayersForTeam[playerTeam],
      this.isTeamRotatingInGame(playerTeam, game, scoringTeam),
    );
  }

  async getNewPlayerPositionForTeam(team: Team, point: Point) {
    const maxPlayerPositionForTeamInCurrentPoint =
      await getMaxPlayerPointPositionForTeamInPoint(team, point);
    return (maxPlayerPositionForTeamInCurrentPoint ?? -1) + 1;
  }

  async getRotatyStrategyInCurrentGame(team: Team) {
    const currentGame = await getCurrentGameOrThrow();
    return this.getRotatyStrategyInGame(currentGame, team);
  }

  private getRotatyStrategyInGame(game: Game, team: Team) {
    return team === 'Red' ? game.rotatyRed : game.rotatyBlue;
  }

  async updateRotatyStrategyForTeamInCurrentGame(
    rotatyStrategy: RotatyStrategy,
    team: Team,
  ) {
    const currentGame = await getCurrentGameOrThrow();
    await updateRotatyStrategyForTeamAndGameId(
      currentGame.id,
      rotatyStrategy,
      team,
    );
  }

  private getNextPlayerPosition(
    previousPosition: number,
    numberOfPlayersOnTeam: number,
    isTeamRotating: boolean,
  ) {
    if (!isTeamRotating) return previousPosition;
    const newPosition =
      previousPosition === 0 ? numberOfPlayersOnTeam - 1 : previousPosition - 1;
    return newPosition;
  }

  private isTeamRotatingInGame(team: Team, game: Game, scoringTeam: Team) {
    const rotationStrategy = this.getTeamRotationStrategyInGame(team, game);
    return this.isTeamRotating(team, rotationStrategy, scoringTeam);
  }

  private isTeamRotating(
    team: Team,
    rotationStrategy: RotatyStrategy,
    scoringTeam: Team,
  ) {
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

  calculateRotatedPositionsForTeam(
    teamPlayerPoints: PlayerPoint[],
    isRotating: boolean,
  ): RotationResult {
    const sorted = [...teamPlayerPoints].sort(
      (a, b) => a.position - b.position,
    );
    const teamSize = sorted.length;

    const positionsByPlayerId = new Map<number, number>();
    const playerIdsToUnskip = new Set<number>();

    if (!isRotating || teamSize === 0) {
      for (const pp of sorted) {
        positionsByPlayerId.set(pp.playerId, pp.position);
      }
      return { positionsByPlayerId, playerIdsToUnskip };
    }

    // Find splitIndex: position 0 always rotates, then consecutive skipped players also rotate
    let splitIndex = 1;
    while (splitIndex < teamSize && sorted[splitIndex].skipped) {
      splitIndex++;
    }

    // If all players after position 0 are skipped, only rotate position 0 (normal rotation)
    if (splitIndex >= teamSize) {
      splitIndex = 1;
    }

    for (let i = 0; i < teamSize; i++) {
      const pp = sorted[i];
      if (i < splitIndex) {
        // Rotated to the back
        const newPosition = teamSize - splitIndex + i;
        positionsByPlayerId.set(pp.playerId, newPosition);
        if (pp.skipped) {
          playerIdsToUnskip.add(pp.playerId);
        }
      } else {
        // Shifted forward
        positionsByPlayerId.set(pp.playerId, i - splitIndex);
      }
    }

    return { positionsByPlayerId, playerIdsToUnskip };
  }

  calculateRotatedPositionsForTeamInGame(
    teamPlayerPoints: PlayerPoint[],
    team: Team,
    scoringTeam: Team,
    game: Game,
  ): RotationResult {
    const isRotating = this.isTeamRotatingInGame(team, game, scoringTeam);
    return this.calculateRotatedPositionsForTeam(teamPlayerPoints, isRotating);
  }

  calculateRotatedPositionsForTeamWithRotatyStrategy(
    teamPlayerPoints: PlayerPoint[],
    team: Team,
    scoringTeam: Team,
    rotatyStrategy: RotatyStrategy,
  ): RotationResult {
    const isRotating = this.isTeamRotating(team, rotatyStrategy, scoringTeam);
    return this.calculateRotatedPositionsForTeam(teamPlayerPoints, isRotating);
  }

  computeStrikerDefenderFlags(
    teamPlayerPoints: PlayerPoint[],
    team: Team,
    strikerPosition: StrikerPosition,
  ): Map<number, StrikerDefenderFlags> {
    const sorted = [...teamPlayerPoints].sort(
      (a, b) => a.position - b.position,
    );
    const nonSkipped = sorted.filter((pp) => !pp.skipped);

    const result = new Map<number, StrikerDefenderFlags>();
    for (const pp of sorted) {
      result.set(pp.playerId, { isStriker: false, isDefender: false });
    }

    if (nonSkipped.length === 0) return result;

    // Determine whether first non-skipped player is striker or defender for this team
    const firstIsStriker =
      (team === 'Blue' &&
        strikerPosition === 'BlueStrikerAtPositionZero') ||
      (team === 'Red' && strikerPosition === 'RedStrikerAtPositionZero');

    const firstNonSkipped = nonSkipped[0];
    const secondNonSkipped = nonSkipped.length > 1 ? nonSkipped[1] : null;

    if (firstIsStriker) {
      result.set(firstNonSkipped.playerId, {
        isStriker: true,
        isDefender: false,
      });
      if (secondNonSkipped) {
        result.set(secondNonSkipped.playerId, {
          isStriker: false,
          isDefender: true,
        });
      }
    } else {
      result.set(firstNonSkipped.playerId, {
        isStriker: false,
        isDefender: true,
      });
      if (secondNonSkipped) {
        result.set(secondNonSkipped.playerId, {
          isStriker: true,
          isDefender: false,
        });
      }
    }

    return result;
  }
}
