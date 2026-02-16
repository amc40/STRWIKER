import { redirect } from 'next/navigation';
import { GameInfoService } from '../../../services/gameInfoService';
import { CurrentGameClient } from './CurrentGameClient';

const gameInfoService = new GameInfoService();

export const dynamic = 'force-dynamic';

export default async function Page({
  params,
}: {
  params: Promise<{ viewportType: string }>;
}) {
  const currentGameInfo = await gameInfoService.getCurrentGameInfo();

  if (currentGameInfo == null) {
    redirect('/no-game-in-progress');
  }

  const { viewportType } = await params;
  const isMobile = viewportType !== 'desktop';

  return (
    <CurrentGameClient
      serverGameId={currentGameInfo.gameId}
      serverRedScore={currentGameInfo.teamInfo.Red.score}
      serverBlueScore={currentGameInfo.teamInfo.Blue.score}
      serverRedRotatyStrategy={currentGameInfo.teamInfo.Red.rotatyStrategy}
      serverBlueRotatyStrategy={currentGameInfo.teamInfo.Blue.rotatyStrategy}
      serverPlayers={currentGameInfo.players}
      serverPointStarted={currentGameInfo.pointStarted}
      isMobile={isMobile}
    />
  );
}
