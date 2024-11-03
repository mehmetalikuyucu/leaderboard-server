import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Leaderboard } from './entities/leaderboard.entity';
import { RedisService } from '@liaoliaots/nestjs-redis';
import Redis from 'ioredis';
import { Player } from 'src/players/entities/player.entity';
import * as moment from 'moment';

@Injectable()
export class LeaderboardService {
  private readonly redis: Redis;

  constructor(
    @InjectRepository(Leaderboard)
    private leaderboardRepository: Repository<Leaderboard>,
    private readonly redisService: RedisService,
  ) {
    this.redis = this.redisService.getOrThrow();
  }
   getPrizePoolKey(): string {
    return `prizepool:${moment().year()}:${moment().week()}`;
  }

   getLeaderboardKey(year: number, week: number): string {
    return `leaderboard:${year}:${week}`;
  }

  private getPlayerDetailsKey(
    year: number,
    week: number,
    playerName: string,
  ): string {
    return `player:${year}:${week}:${playerName}`;
  }
  async calculateTotalWeeklyMoney(
    year: number,
    weekNumber: number,
  ): Promise<number> {
    const leaderboardKey = this.getLeaderboardKey(year, weekNumber);
    try {
      let allScores = await this.redis.zrange(
        leaderboardKey,
        0,
        -1,
        'WITHSCORES',
      );
      if (!allScores.length) {
        await this.populateRedisFromDatabase(year, weekNumber);
        allScores = await this.redis.zrange(
          leaderboardKey,
          0,
          -1,
          'WITHSCORES',
        );
      }
      let totalMoney = 0;
      for (let i = 1; i < allScores.length; i += 2) {
        totalMoney += parseFloat(allScores[i]);
      }
      return totalMoney;
    } catch (error) {
      // try {
      //   const result = await this.leaderboardRepository
      //     .createQueryBuilder('leaderboard')
      //     .select('SUM(leaderboard.money)', 'total')
      //     .where('leaderboard.weekNumber = :weekNumber', { weekNumber })
      //     .andWhere('leaderboard.year = :year', { year })
      //     .getRawOne();

      //   return result?.total || 0;
      // } catch (dbError) {
      //   console.error('Database total money calculation failed:', dbError);
      //   throw dbError;
      // }
    }
  }

  async calculatePrizePool(year: number, weekNumber: number): Promise<number> {
    const totalMoney = await this.calculateTotalWeeklyMoney(year, weekNumber);
    return totalMoney * 0.02;
  }

  async getCalculatedPrizePool(): Promise<number> {
    const prizePoolKey = this.getPrizePoolKey();
    const cachedPrizePool = await this.redis.get(prizePoolKey);
    if (!isNaN(Number(cachedPrizePool)) && cachedPrizePool !== null) {
      return parseFloat(cachedPrizePool);
    }
    const prizePool = await this.calculatePrizePool(
      moment().year(),
      moment().week(),
    );
    await this.redis.set(prizePoolKey, prizePool.toString(), 'EX', 604800);

    return prizePool;
  }

  async updateOrCreateLeaderboardEntry(
    player: Player,
    money: number,
    weekNumber: number,
    year: number,
  ): Promise<Leaderboard> {
    const leaderboardKey = this.getLeaderboardKey(year, weekNumber);
    const playerDetailsKey = this.getPlayerDetailsKey(
      year,
      weekNumber,
      player.playerName,
    );
    const prizePoolKey = this.getPrizePoolKey();
    const prizePool = await this.redis.get(prizePoolKey);
    const previousPool = parseFloat(prizePool);
    const newPool = previousPool + money * 0.02;
    await this.redis.set(prizePoolKey, newPool.toString(), 'EX', 604800);
    try {
      const pipeline = this.redis.pipeline();
      pipeline.zadd(leaderboardKey, money, player.playerName);
      pipeline.hset(playerDetailsKey, {
        playerName: player.playerName,
        money: money.toString(),
        rank: player.rank,
        country: player.user.country,
        userId: player.userId,
        username: player.user.username,
        name: player.user.name,
        surname: player.user.surname,
      });

      const now = new Date();
      const dayOfWeek = now.getDay();
      const daysUntilSunday = (7 - dayOfWeek) % 7;
      const sundayMidnight = new Date(
        now.getFullYear(),
        now.getMonth(),
        now.getDate() + daysUntilSunday,
        24,
        0,
        0,
      );
      const secondsUntilSundayMidnight = Math.floor(
        (sundayMidnight.getTime() - now.getTime()) / 1000,
      );

      pipeline.expire(leaderboardKey, secondsUntilSundayMidnight);
      pipeline.expire(playerDetailsKey, secondsUntilSundayMidnight);

      await pipeline.exec();

      this.updateDatabase(player.playerName, money, weekNumber, year).catch(
        (err) => {
          console.error('Database update failed:', err);
        },
      );

      const [score, details] = await Promise.all([
        this.redis.zscore(leaderboardKey, player.playerName),
        this.redis.hgetall(playerDetailsKey),
      ]);

      return {
        playerName: player.playerName,
        money: parseFloat(score),
        weekNumber,
        year,
        player: details,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as unknown as Leaderboard;
    } catch (error) {
      console.error('Redis operation failed:', error);
      // return this.fallbackToDatabaseUpdate(
      //   player.playerName,
      //   money,
      //   weekNumber,
      //   year,
      // );
    }
  }
  private async populateRedisFromDatabase(year: number, weekNumber: number): Promise<void> {
    const entries = await this.leaderboardRepository.createQueryBuilder('leaderboard')
      .leftJoinAndSelect('leaderboard.player', 'player')
      .leftJoinAndSelect('player.user', 'user')
      .where('leaderboard.weekNumber = :weekNumber', { weekNumber })
      .andWhere('leaderboard.year = :year', { year })
      .getMany();

    if (entries.length === 0) {
      return;
    }

    const leaderboardKey = this.getLeaderboardKey(year, weekNumber);
    const pipeline = this.redis.pipeline();

    const now = new Date();
    const dayOfWeek = now.getDay();
    const daysUntilSunday = (7 - dayOfWeek) % 7;
    const sundayMidnight = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate() + daysUntilSunday,
      24,
      0,
      0,
    );
    const secondsUntilSundayMidnight = Math.floor(
      (sundayMidnight.getTime() - now.getTime()) / 1000,
    );

    for (const entry of entries) {
      const playerDetailsKey = this.getPlayerDetailsKey(
        year,
        weekNumber,
        entry.playerName,
      );

      pipeline.zadd(leaderboardKey, entry.money, entry.playerName);

      if (entry.player?.user) {
        pipeline.hset(playerDetailsKey, {
          playerName: entry.playerName,
          money: entry.money.toString(),
          rank: entry.player.rank,
          country: entry.player.user.country,
          userId: entry.player.userId,
          username: entry.player.user.username,
          name: entry.player.user.name,
          surname: entry.player.user.surname,
        });
      }

      pipeline.expire(leaderboardKey, secondsUntilSundayMidnight);
      pipeline.expire(playerDetailsKey, secondsUntilSundayMidnight);
    }

    await pipeline.exec();
  }

  private async updateDatabase(
    playerName: string,
    money: number,
    weekNumber: number,
    year: number,
  ): Promise<void> {
    const existingEntry = await this.leaderboardRepository.findOne({
      where: {
        playerName,
        weekNumber,
        year,
      },
    });

    if (existingEntry) {
      existingEntry.money = money;
      await this.leaderboardRepository.save(existingEntry);
    } else {
      const newEntry = this.leaderboardRepository.create({
        playerName,
        money,
        weekNumber,
        year,
      });
      await this.leaderboardRepository.save(newEntry);
    }
  }

  private async fallbackToDatabaseUpdate(
    playerName: string,
    money: number,
    weekNumber: number,
    year: number,
  ): Promise<Leaderboard> {
    const existingEntry = await this.leaderboardRepository.findOne({
      where: {
        playerName,
        weekNumber,
        year,
      },
    });

    if (existingEntry) {
      existingEntry.money = money;
      return this.leaderboardRepository.save(existingEntry);
    } else {
      const newEntry = this.leaderboardRepository.create({
        playerName,
        money,
        weekNumber,
        year,
      });
      return this.leaderboardRepository.save(newEntry);
    }
  }

  async getTopPlayers(): Promise<
  Array<{ playerName: string; score: number; rank: number; details: any }>
> {
  const weekNumber = moment().week();
  const year = moment().year();
  const leaderboardKey = this.getLeaderboardKey(year, weekNumber);

  try {
    const exists = await this.redis.exists(leaderboardKey);
    
    if (!exists) {
      await this.populateRedisFromDatabase(year, weekNumber);
    }

    const results = await this.redis.zrevrange(
      leaderboardKey,
      0,
      99,
      'WITHSCORES',
    );

    if (!results.length) {
      return [];
    }

    const topPlayers = [];
    const pipeline = this.redis.pipeline();

    for (let i = 0; i < results.length; i += 2) {
      const playerName = results[i];
      pipeline.zrevrank(leaderboardKey, playerName);
      pipeline.hgetall(
        this.getPlayerDetailsKey(year, weekNumber, playerName),
      );
    }

    const pipelineResults = await pipeline.exec();

    if (!pipelineResults) {
      return [];
    }

    for (let i = 0; i < results.length; i += 2) {
      const playerName = results[i];
      const score = parseFloat(results[i + 1]);
      const pipelineIndex = i / 2;

      const rank = pipelineResults[pipelineIndex * 2][1] as number;
      const details = pipelineResults[pipelineIndex * 2 + 1][1];

      topPlayers.push({
        playerName,
        score,
        rank: rank + 1,
        details,
      });
    }

    return topPlayers;
  } catch (error) {
    console.error('Redis top players lookup failed:', error);
    const entries = await this.leaderboardRepository.find({
      where: { year, weekNumber },
      order: { money: 'DESC' },
      take: 100,
      relations: ['player', 'player.user'],
    });

    return entries.map((entry, index) => ({
      playerName: entry.playerName,
      score: entry.money,
      rank: index + 1,
      details: entry.player ? {
        playerName: entry.playerName,
        money: entry.money.toString(),
        rank: entry.player.rank,
        country: entry.player.user?.country,
        userId: entry.player.userId,
        username: entry.player.user?.username,
        name: entry.player.user?.name,
        surname: entry.player.user?.surname,
      } : null,
    }));
  }
}

async getPlayerRangeWithContext(playerName: string): Promise<{
  message: string;
  data: Array<{
    playerName: string;
    score: number;
    rank: number;
    details: any;
  }>;
}> {
  const year = moment().year();
  const weekNumber = moment().week();
  const leaderboardKey = this.getLeaderboardKey(year, weekNumber);
  try {
    const exists = await this.redis.exists(leaderboardKey);
    
    if (!exists) {
      await this.populateRedisFromDatabase(year, weekNumber);
    }

    const playerRank = await this.redis.zrevrank(leaderboardKey, playerName);

    if (playerRank === null) {
      return {
        data: await this.getTopPlayers(),
        message: "Player not found in this week's leaderboard",
      };
    }

    const rangeStart = Math.max(0, playerRank - 3);
    const rangeEnd = playerRank + 2;

    const results = await this.redis.zrevrange(
      leaderboardKey,
      rangeStart,
      rangeEnd,
      'WITHSCORES',
    );

    if (!results || results.length === 0) {
      return {
        message: 'No results found',
        data: [],
      };
    }

    const pipeline = this.redis.pipeline();
    const playerNames = [];

    for (let i = 0; i < results.length; i += 2) {
      const name = results[i];
      playerNames.push(name);
      pipeline.hgetall(this.getPlayerDetailsKey(year, weekNumber, name));
    }

    const playerDetails = await pipeline.exec();

    const players = results.reduce((acc, curr, index) => {
      if (index % 2 === 0) {
        const playerName = curr;
        const score = parseFloat(results[index + 1]);
        const details = playerDetails[Math.floor(index / 2)][1];
        
        acc.push({
          playerName,
          score,
          details,
          rank: rangeStart + index / 2 + 1,
        });
      }
      return acc;
    }, []);

    return {
      message: 'Results found',
      data: players,
    };

  } catch (error) {
    console.error('Redis operation failed:', error);
    
    try {
      const playerEntry = await this.leaderboardRepository.findOne({
        where: { playerName, year, weekNumber },
      });

      if (!playerEntry) {
        const topEntries = await this.leaderboardRepository.find({
          where: { year, weekNumber },
          order: { money: 'DESC' },
          take: 100,
          relations: ['player', 'player.user'],
        });

        return {
          message: "Player not found in this week's leaderboard",
          data: topEntries.map((entry, index) => ({
            playerName: entry.playerName,
            score: entry.money,
            rank: index + 1,
            details: entry.player ? {
              playerName: entry.playerName,
              money: entry.money.toString(),
              rank: entry.player.rank,
              country: entry.player.user?.country,
              userId: entry.player.userId,
              username: entry.player.user?.username,
              name: entry.player.user?.name,
              surname: entry.player.user?.surname,
            } : null,
          })),
        };
      }

      const query = this.leaderboardRepository.createQueryBuilder('leaderboard')
        .leftJoinAndSelect('leaderboard.player', 'player')
        .leftJoinAndSelect('player.user', 'user')
        .where('leaderboard.year = :year', { year })
        .andWhere('leaderboard.weekNumber = :weekNumber', { weekNumber })
        .orderBy('leaderboard.money', 'DESC');

      const [entries, total] = await query.getManyAndCount();
      
      const playerIndex = entries.findIndex(e => e.playerName === playerName);
      
      if (playerIndex === -1) {
        throw new Error('Player not found');
      }

      const rangeStart = Math.max(0, playerIndex - 3);
      const rangeEnd = Math.min(total - 1, playerIndex + 2);
      
      const rangeEntries = entries.slice(rangeStart, rangeEnd + 1);

      return {
        message: 'Results found',
        data: rangeEntries.map((entry, index) => ({
          playerName: entry.playerName,
          score: entry.money,
          rank: rangeStart + index + 1,
          details: entry.player ? {
            playerName: entry.playerName,
            money: entry.money.toString(),
            rank: entry.player.rank,
            country: entry.player.user?.country,
            userId: entry.player.userId,
            username: entry.player.user?.username,
            name: entry.player.user?.name,
            surname: entry.player.user?.surname,
          } : null,
        })),
      };

    } catch (dbError) {
      console.error('Database operation failed:', dbError);
      return {
        message: 'An error occurred',
        data: [],
      };
    }
  }
}
}
