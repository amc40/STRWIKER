import { PlayerPoint } from '@prisma/client';
import prisma from '../../lib/planetscale';
import { getAllPlayerPointsForPlayerInCurrentGame } from '../repository/playerPointRepository';

interface PlayerPointStats {
  team: string;
  scoredGoal: boolean;
  ownGoal: boolean;
  rattled: boolean;
}

export class StatsEngineFwoar {
  async getPlayerStats(playerId: number) {
    const playerStats = await prisma.playerPoint.findMany({
      where: {
        playerId
      }
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
      ownVsIntentionalGoalRatio
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
  async getNumberOfGoalsScoredByPlayerInCurrentGame(playerId: number) {
    const playerPointsForPlayer =
      await getAllPlayerPointsForPlayerInCurrentGame(playerId);

    if (playerPointsForPlayer == null) return null;

    const intensionalGoals = this.getTotalIntentionalGoals(
      playerPointsForPlayer
    );

    const ownGoals = this.getTotalOwnGoals(playerPointsForPlayer);

    return {
      goalScored: intensionalGoals,
      ownGoalsScored: ownGoals
    };
  }

  // TODO: replace this with calculation of elos, then separate bulk update
  // async updateElosOnGoal(winners: Player[], opposition: Player[]) {
  //   const numberOfWinners = winners.length;
  //   const numberOfEnemies = opposition.length;
  //   const updateOperations = winners.flatMap((winner) => {
  //     return opposition.map((enemy) => {
  //       return this.updatePlayerElos(
  //         winner,
  //         enemy,
  //         1 / (numberOfWinners * numberOfEnemies)
  //       );
  //     });
  //   });
  //   await Promise.all(updateOperations);
  // }

  // async updatePlayerElos(winner: Player, loser: Player, scaler?: number) {
  //   const [newWinnerElo, newLoserElo] = this.calculateElos(
  //     winner.elo,
  //     loser.elo,
  //     scaler
  //   );

  //   const updateWinner = prisma.player.update({
  //     where: {
  //       id: winner.id
  //     },
  //     data: {
  //       elo: newWinnerElo
  //     }
  //   });

  //   const updateLoser = prisma.player.update({
  //     where: {
  //       id: loser.id
  //     },
  //     data: {
  //       elo: newLoserElo
  //     }
  //   });

  //   await Promise.all([updateWinner, updateLoser]);
  // }

  calculateElos(winnerElo: number, loserElo: number, scaler?: number) {
    const K = scaler ? 32 / scaler : 32;
    const expectedScoreWinner =
      1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedScoreLoser =
      1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

    const newWinnerElo = winnerElo + K * (1 - expectedScoreWinner);
    const newLoserElo = loserElo + K * (0 - expectedScoreLoser);

    return [newWinnerElo, newLoserElo];
  }
}
