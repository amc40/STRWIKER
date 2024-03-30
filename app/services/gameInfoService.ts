import { getCurrentGame } from '../repository/gameRepository';
import { getCurrentPointAndPlayersFromGameOrThrow } from '../repository/pointRepository';
import { GameInfo } from '../view/CurrentGameInfo';
import { playerPointWithPlayerToPlayerInfo } from '../view/PlayerInfo';

export class GameInfoService {
  async getCurrentGameInfo(): Promise<GameInfo | null> {
    const currentGame = await getCurrentGame();

    if (currentGame == null) {
      return null;
    }

    const currentPointAndPlayers =
      await getCurrentPointAndPlayersFromGameOrThrow(currentGame);

    const currentPointPlayers = currentPointAndPlayers.playerPoints;
    return {
      players: currentPointPlayers.map(playerPointWithPlayerToPlayerInfo),
      teamInfo: {
        Red: {
          score: currentPointAndPlayers.currentRedScore,
          rotatyStrategy: currentGame.rotatyRed,
        },
        Blue: {
          score: currentPointAndPlayers.currentBlueScore,
          rotatyStrategy: currentGame.rotatyBlue,
        },
      },
    };
  }
}
