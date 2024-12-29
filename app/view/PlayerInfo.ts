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
  skipped: boolean;
  goalsScored: number;
  ownGoalsScored: number;
}

export const playerPointWithPlayerAndGoalsScoredToPlayerInfo = (
  { playerId, team, position, player, skipped }: PlayerPointWithPlayer,
  { goalsScored, ownGoalsScored }: GoalsScored,
): PlayerInfo => ({
  id: playerId,
  name: player.name,
  team: team,
  position,
  skipped,
  goalsScored,
  ownGoalsScored,
});
