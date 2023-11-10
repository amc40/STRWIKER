import prisma from '../../lib/planetscale';

type PlayerPointStats = {
  team: string;
  scoredGoal: boolean;
  ownGoal: boolean;
  rattled: boolean;
};

export class StatsEngineFwoar {
  async getPlayerStats(playerId: number) {
    const playerStats = await prisma.playerPoint.findMany({
      where: {
        playerId
      },
      select: {
        team: true,
        scoredGoal: true,
        ownGoal: true,
        rattled: true
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

  getTotalIntentionalGoals(playerStats: PlayerPointStats[]) {
    return playerStats.filter((stat) => stat.scoredGoal).length;
  }

  getTotalOwnGoals(playerStats: PlayerPointStats[]) {
    return playerStats.filter((stat) => stat.ownGoal).length;
  }

  getRattledRatio(playerStats: PlayerPointStats[]) {
    return this.getTotalRattledMoments(playerStats) / playerStats.length;
  }

  getTotalRattledMoments(playerStats: PlayerPointStats[]) {
    return playerStats.filter((stat) => stat.rattled).length;
  }

  getScoreRatio(playerStats: PlayerPointStats[]) {
    return this.getTotalOwnGoals(playerStats) / playerStats.length;
  }

  getTotalPoints(playerStats: PlayerPointStats[]) {
    return playerStats.length;
  }

  getTotalGoals(playerStats: PlayerPointStats[]) {
    return playerStats.filter((stat) => stat.scoredGoal || stat.ownGoal).length;
  }

  getOwnVsIntentionalGoalRatio(playerStats: PlayerPointStats[]) {
    return this.getTotalOwnGoals(playerStats) / this.getTotalGoals(playerStats);
  }

  updateElo(winnerElo: number, loserElo: number) {
    const K = 32;
    const expectedScoreWinner =
      1 / (1 + Math.pow(10, (loserElo - winnerElo) / 400));
    const expectedScoreLoser =
      1 / (1 + Math.pow(10, (winnerElo - loserElo) / 400));

    const newWinnerElo = winnerElo + K * (1 - expectedScoreWinner);
    const newLoserElo = loserElo + K * (0 - expectedScoreLoser);

    return [newWinnerElo, newLoserElo];
  }
}
