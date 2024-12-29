import { PlayerPoint, Team } from '@prisma/client';
import { getPointAndPlayersFromPointIdOrThrow } from '../repository/pointRepository';
import { mapRecordValues } from '../utils/recordUtils';

export class PointParticipantService {
  MAX_PARTICIPATING_PLAYERS_PER_TEAM = 2;

  async getParticipatingPlayersInPointByTeam(pointId: number) {
    const { playerPoints: allPlayersPointsAndPlayersInPoint } =
      await getPointAndPlayersFromPointIdOrThrow(pointId);

    const participatingPlayerPointsWithPlayer =
      this.getParticipatingPlayersByTeam(allPlayersPointsAndPlayersInPoint);

    return mapRecordValues(
      participatingPlayerPointsWithPlayer,
      (participatingPlayerPoints) =>
        participatingPlayerPoints.map(
          (participatingPlayerPoint) => participatingPlayerPoint.player,
        ),
    );
  }

  getParticipatingPlayers<T extends PlayerPoint>(playerPoints: T[]): T[] {
    return Object.values(
      this.getParticipatingPlayersByTeam(playerPoints),
    ).flat();
  }

  private getParticipatingPlayersByTeam<T extends PlayerPoint>(
    playerPoints: T[],
  ): Record<Team, T[]> {
    return {
      Red: this.getParticipatingPlayersForTeam(playerPoints, 'Red'),
      Blue: this.getParticipatingPlayersForTeam(playerPoints, 'Blue'),
    };
  }

  private getParticipatingPlayersForTeam<T extends PlayerPoint>(
    playerPoints: T[],
    team: Team,
  ): T[] {
    const participatingPlayerPointsInTeam: T[] = [];
    const sortedPlayerPointsByPosition = [...playerPoints].sort(
      (a, b) => a.position - b.position,
    );
    for (const playerPoint of sortedPlayerPointsByPosition) {
      if (
        participatingPlayerPointsInTeam.length >=
        this.MAX_PARTICIPATING_PLAYERS_PER_TEAM
      ) {
        break;
      }
      if (playerPoint.team !== team) {
        continue;
      }
      if (playerPoint.skipped) {
        continue;
      }
      participatingPlayerPointsInTeam.push(playerPoint);
    }
    console.log(
      'participating players in ',
      team,
      participatingPlayerPointsInTeam,
    );
    return participatingPlayerPointsInTeam;
  }
}
