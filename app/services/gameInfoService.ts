import { getCurrentGame } from '../repository/gameRepository';
import { getCurrentPointAndPlayersFromGameOrThrow } from '../repository/pointRepository';
import { GameInfo } from '../view/CurrentGameInfo';
import { playerPointWithPlayerToPlayerInfo } from '../view/PlayerInfo';

export class GameInfoService {
  async getCurrentGameInfo(): Promise<GameInfo> {
    const currentGame = await getCurrentGame();

    if (currentGame == null) {
      return {
        gameInProgress: false,
      };
    }

    const currentPointAndPlayers =
      await getCurrentPointAndPlayersFromGameOrThrow(currentGame);

    const currentPointPlayers = currentPointAndPlayers.playerPoints;
    return {
      players: currentPointPlayers.map(playerPointWithPlayerToPlayerInfo),
      redScore: currentPointAndPlayers.currentRedScore,
      blueScore: currentPointAndPlayers.currentBlueScore,
      gameInProgress: true,
    };
  }
}
