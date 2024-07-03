import { redirect } from 'next/navigation';
import { GameInfoService } from '../../../services/gameInfoService';
import { CurrentGameClient } from './CurrentGameClient';

const gameInfoService = new GameInfoService();

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: { viewportType: string };
}) {
  const currentGameInfo = await gameInfoService.getCurrentGameInfo();

  if (currentGameInfo == null) {
    redirect('/no-game-in-progress');
  }

  const isMobile = params.viewportType !== 'desktop';

  return (
    <CurrentGameClient
      serverGameId={currentGameInfo.gameId}
      serverRedScore={currentGameInfo.teamInfo.Red.score}
      serverBlueScore={currentGameInfo.teamInfo.Blue.score}
      serverRedRotatyStrategy={currentGameInfo.teamInfo.Red.rotatyStrategy}
      serverBlueRotatyStrategy={currentGameInfo.teamInfo.Blue.rotatyStrategy}
      serverPlayers={currentGameInfo.players}
      isMobile={isMobile}
    />
  );
}
