import { Game } from '@prisma/client';
import { GameLogicService } from '../../../../services/gameLogicService';
import { getCurrentPointPlayerForPlayerIdInCurrentGame } from '../../../../repository/playerPointRepository';

type RequestData = {
  playerId: number;
  ownGoal: boolean;
};

type ResponseData = Game;

export const POST = async function handler(req: Request) {
  const { playerId, ownGoal } = (await req.json()) as RequestData;

  // find player point id

  const pointPlayer =
    await getCurrentPointPlayerForPlayerIdInCurrentGame(playerId);

  const gameLogicService = new GameLogicService();

  gameLogicService.scoreGoal(pointPlayer, ownGoal);

  return Response.json(game as ResponseData);
};
