import { GameInfoService } from '../services/gameInfoService';
import { CurrentGameClient } from './CurrentGameClient';
import { NoGameInProgress } from './NoGameInProgress';

const gameInfoService = new GameInfoService();

export default async function Page() {
  const currentGameInfo = await gameInfoService.getCurrentGameInfo();

  return currentGameInfo != null ? (
    <CurrentGameClient
      serverRedScore={currentGameInfo.redScore}
      serverBlueScore={currentGameInfo.blueScore}
      serverPlayers={currentGameInfo.players}
    />
  ) : (
    <NoGameInProgress />
  );
}
