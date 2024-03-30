import { GameInfoService } from '../services/gameInfoService';
import { CurrentGameClient } from './CurrentGameClient';
import { NoGameInProgress } from './NoGameInProgress';

const gameInfoService = new GameInfoService();

export default async function Page() {
  const currentGameInfo = await gameInfoService.getCurrentGameInfo();

  return currentGameInfo != null ? (
    <CurrentGameClient
      serverRedScore={currentGameInfo.teamInfo.Red.score}
      serverBlueScore={currentGameInfo.teamInfo.Blue.score}
      serverRedRotatyStrategy={currentGameInfo.teamInfo.Red.rotatyStrategy}
      serverBlueRotatyStrategy={currentGameInfo.teamInfo.Blue.rotatyStrategy}
      serverPlayers={currentGameInfo.players}
    />
  ) : (
    <NoGameInProgress />
  );
}
