import { RotatyStrategy } from '@prisma/client';
import { PlayerInfo } from './PlayerInfo';

export interface GameState {
  players: PlayerInfo[];
  redScore: number;
  blueScore: number;
  redRotatyStrategy: RotatyStrategy;
  blueRotatyStrategy: RotatyStrategy;
  pointStarted: boolean;
}
