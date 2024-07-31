import {
  Game,
  HistoricalPlayerStats,
  Player,
  PlayerPoint,
  Prisma,
} from '@prisma/client';
import prisma from '../../lib/planetscale';
import {
  getCountOfGoalsScoredByEachPlayerInGame as getCountOfGoalsScoredByEachPlayerIdInGame,
  getCountOfOwnGoalsScoredByEachPlayerInGame as getCountOfOwnGoalsScoredByEachPlayerIdInGame,
} from '../repository/playerPointRepository';
import { PlayerService } from './playerService';
import { getAllPointsInGame } from '../repository/pointRepository';
import moment from 'moment';
import {
  HistoricalPlayerStatValues,
  getHistoricalPlayerStatsInGameId,
  getMostRecentHistoricalPlayerStatsBeforeThreshold,
} from '../repository/historicalPlayerStatsRepository';
import { PlayerWithoutStatValues } from '../repository/playerRepository';

interface PlayerPointStats {
  team: string;
  scoredGoal: boolean;
  ownGoal: boolean;
  rattled: boolean;
}

export interface GoalsScored {
  goalsScored: number;
  ownGoalsScored: number;
}

export type WithRanking<T> = T & { ranking: number };

type HistoricalPlayerStatValuesForPlayerBeforeAndAfterGameWithChange =
  PlayerWithoutStatValues & {
    // may be null if the player hasn't participated in a game previous to the current one
    beforeGameStatValues: HistoricalPlayerStatValues | null;
    // may be null if the player hasn't participated in any game
    afterGameStatValues: HistoricalPlayerStatValues | null;
    // if either of the before or after values are null then the change will be null
    changeInGameStatValues: HistoricalPlayerStatValues | null;
  };

export type PlayerEloAfterGameAndChange = PlayerWithoutStatValues & {
  elo: number;
  changeInElo: number | null;
};

export class StatsEngineFwoar {
  playerService = new PlayerService();

  async getPlayerStats(playerId: number) {
    const playerStats = await prisma.playerPoint.findMany({
      where: {
        playerId,
      },
    });

    const totalIntentionalGoals = this.getTotalIntentionalGoals(playerStats);
    const totalOwnGoals = this.getTotalOwnGoals(playerStats);
    const rattledRatio = this.getRattledRatio(playerStats);
    const scoreRatio = this.getScoreRatio(playerStats);
    const totalPointsPlayed = this.getTotalPoints(playerStats);
    const ownVsIntentionalGoalRatio =
      this.getOwnVsIntentionalGoalRatio(playerStats);

    return {
      totalIntentionalGoals,
      totalOwnGoals,
      rattledRatio,
      scoreRatio,
      totalPointsPlayed,
      ownVsIntentionalGoalRatio,
    };
  }

  getTotalIntentionalGoals(playerStats: PlayerPoint[]) {
    return playerStats.filter((stat) => stat.scoredGoal).length;
  }

  getTotalOwnGoals(playerStats: PlayerPoint[]) {
    return playerStats.filter((stat) => stat.ownGoal).length;
  }

  getRattledRatio(playerStats: PlayerPointStats[]) {
    return this.getTotalRattledMoments(playerStats) / playerStats.length;
  }

  getTotalRattledMoments(playerStats: PlayerPointStats[]) {
    return playerStats.filter((stat) => stat.rattled).length;
  }

  getScoreRatio(playerStats: PlayerPoint[]) {
    return this.getTotalOwnGoals(playerStats) / playerStats.length;
  }

  getTotalPoints(playerStats: PlayerPoint[]) {
    return playerStats.length;
  }

  getTotalGoals(playerStats: PlayerPoint[]) {
    return playerStats.filter((stat) => stat.scoredGoal || stat.ownGoal).length;
  }

  getOwnVsIntentionalGoalRatio(playerStats: PlayerPoint[]) {
    return this.getTotalOwnGoals(playerStats) / this.getTotalGoals(playerStats);
  }

  async getNumberOfGoalsScoredByEachPlayerInGame(gameId: number) {
    const countOfGoalsScoredByEachPlayerId =
      await getCountOfGoalsScoredByEachPlayerIdInGame(gameId);

    const goalsScoredByEachPlayerId = countOfGoalsScoredByEachPlayerId.map(
      ({ playerId, _count }) => ({
        playerId,
        goalsScored: _count.playerId,
      }),
    );

    return this.playerService.joinWithPlayers(goalsScoredByEachPlayerId);
  }

  async getNumberOfOwnGoalsScoredByEachPlayerInGame(gameId: number) {
    const countOfOwnGoalsScoredByEachPlayerId =
      await getCountOfOwnGoalsScoredByEachPlayerIdInGame(gameId);

    const ownGoalsByEachPlayerId = countOfOwnGoalsScoredByEachPlayerId.map(
      ({ playerId, _count }) => ({
        playerId,
        ownGoals: _count.playerId,
      }),
    );

    return this.playerService.joinWithPlayers(ownGoalsByEachPlayerId);
  }

  getNumberOfGoalsScoredInPlayerPoints(
    playerPointsForPlayer: PlayerPoint[],
  ): GoalsScored {
    const intensionalGoals = this.getTotalIntentionalGoals(
      playerPointsForPlayer,
    );

    const ownGoals = this.getTotalOwnGoals(playerPointsForPlayer);

    return {
      goalsScored: intensionalGoals,
      ownGoalsScored: ownGoals,
    };
  }

  async getPlayersOrderedByEloWithChangeSinceLastGame(
    currentGameId: number,
  ): Promise<WithRanking<PlayerEloAfterGameAndChange>[]> {
    const historicalPlayerStatValuesForEachPlayerBeforeAndAfterGameWithChange =
      await this.getHistoricalPlayerStatValuesForEachPlayerBeforeAndAfterGameWithChange(
        currentGameId,
      );

    const playerElosWithChangeSinceLastGame =
      historicalPlayerStatValuesForEachPlayerBeforeAndAfterGameWithChange.reduce<
        PlayerEloAfterGameAndChange[]
      >(
        (
          accumulatingArray,
          historicalPlayerStatsBeforeAndAfterGameWithChange,
        ) => {
          const { id, name, afterGameStatValues, changeInGameStatValues } =
            historicalPlayerStatsBeforeAndAfterGameWithChange;

          if (afterGameStatValues == null) {
            return accumulatingArray;
          }
          return [
            ...accumulatingArray,
            {
              id,
              name,
              elo: afterGameStatValues.elo,
              changeInElo: changeInGameStatValues?.elo ?? null,
            },
          ];
        },
        [],
      );

    playerElosWithChangeSinceLastGame.sort(
      ({ elo: eloA }, { elo: eloB }) => eloB - eloA,
    );

    return this.fromOrderedByStatAddRanking(
      playerElosWithChangeSinceLastGame,
      ({ elo }) => elo,
    );
  }

  private async getHistoricalPlayerStatValuesForEachPlayerBeforeAndAfterGameWithChange(
    gameId: number,
  ): Promise<
    HistoricalPlayerStatValuesForPlayerBeforeAndAfterGameWithChange[]
  > {
    const currentGame = await prisma.game.findUniqueOrThrow({
      where: {
        id: gameId,
      },
    });

    const historicalPlayerStatValuesForEachPlayerBeforeGame =
      await this.getHistoricalPlayerStatValuesForEachPlayerBeforeGame(
        currentGame,
      );

    const historicalPlayerStatValuesForEachPlayerBeforeAndAfterGame =
      await this.getHistoricalPlayerStatValuesForEachPlayerBeforeAndAfterGame(
        gameId,
        historicalPlayerStatValuesForEachPlayerBeforeGame,
      );

    return historicalPlayerStatValuesForEachPlayerBeforeAndAfterGame.map(
      (historicalStatValuesForPlayerBeforeAndAfterGame) => ({
        ...historicalStatValuesForPlayerBeforeAndAfterGame,
        changeInGameStatValues:
          this.getChangeInHistoricalStatsBeforeAndAfterGame(
            historicalStatValuesForPlayerBeforeAndAfterGame.beforeGameStatValues,
            historicalStatValuesForPlayerBeforeAndAfterGame.afterGameStatValues,
          ),
      }),
    );
  }

  private getChangeInHistoricalStatsBeforeAndAfterGame(
    beforeGameStatValues: HistoricalPlayerStatValues | null,
    afterGameStatValues: HistoricalPlayerStatValues | null,
  ): HistoricalPlayerStatValues | null {
    if (beforeGameStatValues == null || afterGameStatValues == null) {
      return null;
    }

    return {
      elo: afterGameStatValues.elo - beforeGameStatValues.elo,
      gamesPlayed:
        afterGameStatValues.gamesPlayed - beforeGameStatValues.gamesPlayed,
    };
  }

  private async getHistoricalPlayerStatValuesForEachPlayerBeforeGame(
    game: Game,
  ): Promise<
    Omit<
      HistoricalPlayerStatValuesForPlayerBeforeAndAfterGameWithChange,
      'afterGameStatValues' | 'changeInGameStatValues'
    >[]
  > {
    const lastGameStatsForEachPlayer =
      await getMostRecentHistoricalPlayerStatsBeforeThreshold(game.startTime);

    return lastGameStatsForEachPlayer.map(
      ({ id, name, previousElo, previousGamesPlayed }) => {
        return {
          id,
          name,
          beforeGameStatValues:
            previousElo != null
              ? {
                  elo: previousElo,
                  gamesPlayed: previousGamesPlayed,
                }
              : null,
        };
      },
    );
  }

  private async getHistoricalPlayerStatValuesForEachPlayerBeforeAndAfterGame(
    gameId: number,
    historicalPlayerStatValuesForEachPlayerBeforeGame: Omit<
      HistoricalPlayerStatValuesForPlayerBeforeAndAfterGameWithChange,
      'afterGameStatValues' | 'changeInGameStatValues'
    >[],
  ): Promise<
    Omit<
      HistoricalPlayerStatValuesForPlayerBeforeAndAfterGameWithChange,
      'changeInGameStatValues'
    >[]
  > {
    const historicalPlayerStatsForGameParticipants =
      await getHistoricalPlayerStatsInGameId(gameId);

    return historicalPlayerStatValuesForEachPlayerBeforeGame.map(
      (historicalStatValuesForPlayerBeforeGame) => ({
        ...historicalStatValuesForPlayerBeforeGame,
        afterGameStatValues: this.getHistoricalStatValuesForPlayerIdAfterGame(
          historicalStatValuesForPlayerBeforeGame.id,
          historicalPlayerStatsForGameParticipants,
          historicalStatValuesForPlayerBeforeGame.beforeGameStatValues,
        ),
      }),
    );
  }

  private getHistoricalStatValuesForPlayerIdAfterGame(
    playerId: number,
    historicalPlayerStatsForGameParticipants: HistoricalPlayerStats[],
    lastGameStatsForPlayer: HistoricalPlayerStatValues | null,
  ): HistoricalPlayerStatValues | null {
    const historicalPlayerStatForGameIfParticipant =
      historicalPlayerStatsForGameParticipants.find(
        ({ playerId: participantPlayerId }) => participantPlayerId === playerId,
      );

    if (historicalPlayerStatForGameIfParticipant != null) {
      return {
        elo: historicalPlayerStatForGameIfParticipant.elo,
        gamesPlayed: historicalPlayerStatForGameIfParticipant.gamesPlayed,
      };
    }

    if (lastGameStatsForPlayer != null) {
      return { ...lastGameStatsForPlayer };
    }

    return null;
  }

  // Note: rankings start from 1
  fromOrderedByStatAddRanking<T>(
    orderedByBestStatFirst: T[],
    getStatFromElement: (element: T) => number,
  ): WithRanking<T>[] {
    let prevStat: number | null = null;
    let currentRanking = 0;

    return orderedByBestStatFirst.map((element) => {
      const currentStat = getStatFromElement(element);

      if (prevStat === null || currentStat !== prevStat) {
        currentRanking += 1;
      }

      prevStat = currentStat;

      return { ...element, ranking: currentRanking };
    });
  }

  async getLongestPointsInGame(gameId: number, take: number) {
    const pointsAndDurations =
      await this.getAllPointsInGameWithDuration(gameId);

    pointsAndDurations.sort(
      (
        { durationInSeconds: durationInSecondsA },
        { durationInSeconds: durationInSecondsB },
      ) => durationInSecondsB - durationInSecondsA,
    );
    const topPointsAndDurations = pointsAndDurations.slice(0, take);

    return topPointsAndDurations;
  }

  private async getAllPointsInGameWithDuration(gameId: number) {
    const pointsInGame = await getAllPointsInGame(gameId);
    return pointsInGame.map((point) => ({
      ...point,
      durationInSeconds: moment(point.endTime).diff(
        moment(point.startTime),
        'seconds',
      ),
    }));
  }

  async updateElosOnGoal(winners: Player[], opposition: Player[]) {
    const numberOfWinners = winners.length;
    const numberOfEnemies = opposition.length;
    const updateOperations = winners.flatMap((winner) => {
      return opposition.map((enemy) => {
        return this.updatePlayerElos(
          winner,
          enemy,
          1 / (numberOfWinners * numberOfEnemies),
        );
      });
    });
    await Promise.all(updateOperations);
  }

  private async updatePlayerElos(
    winner: Player,
    loser: Player,
    scaler?: number,
  ) {
    const [newWinnerElo, newLoserElo] = this.calculateElos(
      winner.elo,
      loser.elo,
      scaler,
    );

    const updateWinner = prisma.player.update({
      where: {
        id: winner.id,
      },
      data: {
        elo: newWinnerElo,
      },
    });

    const updateLoser = prisma.player.update({
      where: {
        id: loser.id,
      },
      data: {
        elo: newLoserElo,
      },
    });

    await Promise.all([updateWinner, updateLoser]);
  }

  private calculateElos(winnerElo: number, loserElo: number, scaler?: number) {
    const K = scaler ? 32 / scaler : 32;
    const expectedScoreWinner =
      1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedScoreLoser =
      1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

    const newWinnerElo = winnerElo + K * (1 - expectedScoreWinner);
    const newLoserElo = loserElo + K * (0 - expectedScoreLoser);

    return [newWinnerElo, newLoserElo];
  }

  async updatePlayerStatsAtEndOfGame(
    participatingPlayers: Player[],
    game: Game,
  ) {
    await this.incrementNumberOfGamesPlayed(participatingPlayers);
    await this.saveSnapshotOfStatsToHistoricalPlayerStats(
      participatingPlayers,
      game,
    );
  }

  private async incrementNumberOfGamesPlayed(participatingPlayers: Player[]) {
    participatingPlayers.forEach(
      (participatingPlayer) => participatingPlayer.gamesPlayed++,
    );
    await prisma.player.updateMany({
      data: {
        gamesPlayed: {
          increment: 1,
        },
      },
      where: {
        id: {
          in: participatingPlayers.map(({ id }) => id),
        },
      },
    });
  }

  private async saveSnapshotOfStatsToHistoricalPlayerStats(
    // NOTE: this should include players that aren't in the game during the final point
    allGameParticipants: Player[],
    game: Game,
  ) {
    const historicalStatsForParticipatingPlayers: Prisma.HistoricalPlayerStatsCreateManyInput[] =
      allGameParticipants.map((participatingPlayer) => ({
        playerId: participatingPlayer.id,
        gameId: game.id,
        gamesPlayed: participatingPlayer.gamesPlayed,
        elo: participatingPlayer.elo,
      }));

    await prisma.historicalPlayerStats.createMany({
      data: historicalStatsForParticipatingPlayers,
    });
  }
}
