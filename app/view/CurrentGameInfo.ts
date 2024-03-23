import { PlayerInfo } from './PlayerInfo';

interface NotInProgressGameInfo {
  gameInProgress: false;
}

interface InProgressGameInfo {
  players: PlayerInfo[];
  redScore: number;
  blueScore: number;
  gameInProgress: true;
}

export type GameInfo = NotInProgressGameInfo | InProgressGameInfo;
