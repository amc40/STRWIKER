import { GameInfoService } from '../../../../services/gameInfoService';
import { StatusCodes } from 'http-status-codes';

const gameInfoService = new GameInfoService();

export const dynamic = 'force-dynamic';

export async function GET() {
  const currentGameInfo = await gameInfoService.getCurrentGameInfo();

  if (currentGameInfo == null) {
    return new Response('No game in progress', {
      status: StatusCodes.NOT_FOUND,
    });
  }

  return Response.json(currentGameInfo);
}
