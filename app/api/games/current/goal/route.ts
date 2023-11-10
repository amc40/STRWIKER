import { Game } from '@prisma/client';
import { GameLogicService } from '../../../../services/gameLogicService';
import { getCurrentPointPlayerForPlayerIdInCurrentGame } from '../../../../repository/playerPointRepository';
import prisma from '../../../../../lib/planetscale';

type RequestData = {
  playerPointId: number;
  ownGoal: boolean;
};

type ResponseData = Game;

export const POST = async function handler(req: Request) {
  const { playerPointId, ownGoal } = (await req.json()) as RequestData;

  const playerPoint = await prisma.playerPoint.findUniqueOrThrow({
    where: {
      id: playerPointId
    }
  });

  const gameLogicService = new GameLogicService();

  gameLogicService.scoreGoal(playerPoint, ownGoal);

  return Response.json(game as ResponseData);
};
