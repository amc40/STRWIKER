import { PlayerPoint } from '@prisma/client';
import { getCurrentGame } from '../repository/gameRepository';
import { getCurrentPointAndPlayersFromGameOrThrow } from '../repository/pointRepository';
import { GameInfo } from '../view/CurrentGameInfo';
import { playerPointWithPlayerAndGoalsScoredToPlayerInfo } from '../view/PlayerInfo';
import { GoalsScored, StatsEngineFwoar } from './statsEngine';
import { getAllPlayerPointsForPlayersInGame } from '../repository/playerPointRepository';

export class GameInfoService {
  statsEngine = new StatsEngineFwoar();

  async isGameInProgress(): Promise<boolean> {
    return (await getCurrentGame()) != null;
  }

  async getCurrentGameInfo(): Promise<GameInfo | null> {
    const currentGame = await getCurrentGame();

    if (currentGame == null) {
      return null;
    }

    const currentPointAndPlayers =
      await getCurrentPointAndPlayersFromGameOrThrow(currentGame);
    const currentPlayerIds = currentPointAndPlayers.playerPoints.map(
      (playerPoint) => playerPoint.playerId,
    );

    const allPlayerPointsInGameForCurrentPlayers =
      await getAllPlayerPointsForPlayersInGame(
        currentPlayerIds,
        currentGame.id,
      );

    const currentPointPlayers = currentPointAndPlayers.playerPoints;
    return {
      players: currentPointPlayers.map((playerPointWithPlayer) => {
        const goalsScored = this.getGoalsScoredForPlayerIdFromAllPlayerPoints(
          playerPointWithPlayer.playerId,
          allPlayerPointsInGameForCurrentPlayers,
        );
        return playerPointWithPlayerAndGoalsScoredToPlayerInfo(
          playerPointWithPlayer,
          goalsScored,
        );
      }),
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

  private getGoalsScoredForPlayerIdFromAllPlayerPoints(
    playerId: number,
    allPlayerPointsInGameForCurrentPlayers: PlayerPoint[],
  ): GoalsScored {
    const playerPointsForPlayer = allPlayerPointsInGameForCurrentPlayers.filter(
      (playerPoint) => playerPoint.playerId === playerId,
    );

    return this.statsEngine.getNumberOfGoalsScoredInPlayerPoints(
      playerPointsForPlayer,
    );
  }
}
