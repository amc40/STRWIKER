import { getCurrentPointFromGameOrThrow } from '../repository/pointRepository';
import { PlayerInfo } from './PlayerInfo';

export type NotInProgressGameInfo = {
  gameInProgress: false;
};

export type InProgressGameInfo = {
  players: PlayerInfo[];
  redScore: number;
  blueScore: number;
  gameInProgress: true;
};

export type GameInfo = NotInProgressGameInfo | InProgressGameInfo;
