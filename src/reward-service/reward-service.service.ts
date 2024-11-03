import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from '../players/entities/player.entity';
import { PlayersService } from '../players/players.service';
import * as moment from 'moment';
import { LeaderboardService } from '../leaderboard/leaderboard.service';
import { Cron } from '@nestjs/schedule';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';

@Injectable()
export class RewardServiceService {
  private readonly redis: Redis;
  constructor(
    @InjectRepository(Player)
    private readonly playerRepository: Repository<Player>,
    private readonly leaderboardService: LeaderboardService,
    private readonly playersService: PlayersService,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }

  async distributeWeeklyRewards(): Promise<void> {
    try {
      const topPlayers = await this.leaderboardService.getTopPlayers();
      console.log('Top Players Count:', topPlayers.length);

      if (topPlayers.length === 0) {
        console.log('No players found for reward distribution');
        return;
      }
      const prizePool = await this.leaderboardService.getCalculatedPrizePool();

      if (prizePool <= 0) {
        console.log('No prize pool available for distribution');
        return;
      }

      const distributions = await this.calculateDistributions(
        prizePool,
        topPlayers,
      );
      await this.processDistributions(distributions);

      console.log('Reward distribution completed successfully');
    } catch (error) {
      console.error('Error in reward distribution:', error);
      throw error;
    }
  }

  private async calculateDistributions(
    prizePool: number,
    topPlayers: Array<{ playerName: string; score: number }>,
  ): Promise<Array<{ playerName: string; amount: number }>> {
    const distributions: Array<{ playerName: string; amount: number }> = [];


    if (topPlayers.length >= 1) {
      distributions.push({
        playerName: topPlayers[0].playerName,
        amount: prizePool * 0.2, // %20
      });
    }

    if (topPlayers.length >= 2) {
      distributions.push({
        playerName: topPlayers[1].playerName,
        amount: prizePool * 0.15, // %15
      });
    }

    if (topPlayers.length >= 3) {
      distributions.push({
        playerName: topPlayers[2].playerName,
        amount: prizePool * 0.1, // %10
      });
    }

    const remainingPrizePool = prizePool * 0.55;
    const remainingPlayers = topPlayers.slice(3);

    if (remainingPlayers.length > 0) {
      let totalShares = 0;
      for (let i = 0; i < remainingPlayers.length; i++) {
        totalShares += remainingPlayers.length - i;
      }

      for (let i = 0; i < remainingPlayers.length; i++) {
        const share = (remainingPlayers.length - i) / totalShares;
        distributions.push({
          playerName: remainingPlayers[i].playerName,
          amount: remainingPrizePool * share,
        });
      }
    }

    return distributions;
  }

  private async processDistributions(
    distributions: Array<{ playerName: string; amount: number }>,
  ): Promise<void> {
    for (const distribution of distributions) {
      try {
        const player = await this.playerRepository.findOne({
          where: { playerName: distribution.playerName },
        });

        if (player) {
          await this.playersService.updateMoneyWithoutRedis(
            player.id,
            distribution.amount,
          );

          console.log(
            `Distributed ${distribution.amount} to ${player.playerName}`,
          );
        }
      } catch (error) {
        console.error(
          `Error processing distribution for ${distribution.playerName}:`,
          error,
        );
        continue;
      }
    }
  }

  @Cron('0 0 * * 0')
  async weeklyRewardDistribution() {
    try {
      await this.distributeWeeklyRewards();
      const leaderboardKey = this.leaderboardService.getLeaderboardKey(
        moment().year(),
        moment().week(),
      );
      const prizePool = this.leaderboardService.getPrizePoolKey();
      await this.redis.del(leaderboardKey);
      await this.redis.del(prizePool);

      console.log('Weekly reward distribution completed');
    } catch (error) {
      console.error('Error in weekly reward distribution:', error);
    }
  }
}
