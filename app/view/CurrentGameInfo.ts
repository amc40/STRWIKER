import { RotatyStrategy, Team } from '@prisma/client';
import { PlayerInfo } from './PlayerInfo';

interface TeamInfo {
  score: number;
  rotatyStrategy: RotatyStrategy;
}

export interface GameInfo {
  players: PlayerInfo[];
  teamInfo: Record<Team, TeamInfo>;
}
