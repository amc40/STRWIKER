import { Player, PlayerPoint, Team } from '@prisma/client';

export interface PlayerPointWithPlayer extends PlayerPoint {
  player: Player;
}

export interface PlayerInfo {
  id: number;
  name: string;
  team: Team;
  position: number;
}

export const playerPointWithPlayerToPlayerInfo = ({
  playerId,
  team,
  position,
  player
}: PlayerPointWithPlayer): PlayerInfo => ({
  id: playerId,
  name: player.name,
  team: team,
  position
});
