import { Player } from '@prisma/client';
import { getPlayersWithIdsIn } from '../repository/playerRepository';

export class PlayerService {
  async joinWithPlayers<T extends { playerId: number }>(
    toJoinWithPlayers: T[],
  ): Promise<(T & { player: Player })[]> {
    const playerIds = toJoinWithPlayers.map(({ playerId }) => playerId);
    const players = await getPlayersWithIdsIn(playerIds);
    return toJoinWithPlayers.map((entry) => ({
      player: this.findPlayerWithIdOrThrow(players, entry.playerId),
      ...entry,
    }));
  }

  private findPlayerWithIdOrThrow(players: Player[], playerId: number) {
    const player = players.find((player) => player.id === playerId);
    if (player == null) {
      throw new Error(
        `Could not find player with id '${playerId.toString()}' in ${JSON.stringify(
          players,
        )}`,
      );
    }
    return player;
  }
}
