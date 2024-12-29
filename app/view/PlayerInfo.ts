import { Player, PlayerPoint, Team } from '@prisma/client';
import { GoalsScored } from '../services/statsEngine';

interface PlayerPointWithPlayer extends PlayerPoint {
  player: Player;
}

export interface PlayerInfo {
  id: number;
  name: string;
  team: Team;
  position: number;
  participant: boolean;
  skipped: boolean;
  goalsScored: number;
  ownGoalsScored: number;
}

export const createPlayerInfo = (
  { playerId, team, position, player, skipped }: PlayerPointWithPlayer,
  { goalsScored, ownGoalsScored }: GoalsScored,
  participant: boolean,
): PlayerInfo => ({
  id: playerId,
  name: player.name,
  team: team,
  position,
  participant,
  skipped,
  goalsScored,
  ownGoalsScored,
});
