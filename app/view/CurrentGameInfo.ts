import { PlayerInfo } from './PlayerInfo';

type NotInProgressGameInfo = {
  gameInProgress: false;
};

type InProgressGameInfo = {
  players: PlayerInfo[];
  redScore: number;
  blueScore: number;
  gameInProgress: true;
};

export type GameInfo = NotInProgressGameInfo | InProgressGameInfo;
