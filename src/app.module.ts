import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { ScheduleModule } from '@nestjs/schedule';
import { getDatabaseConfig } from './config/database.config';
import { PlayersModule } from './players/players.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
// import { redisStore } from "cache-manager-redis-store";
// import { CacheModule, CacheStore } from '@nestjs/cache-manager';
import { RewardServiceService } from './reward-service/reward-service.service';
import { RewardServiceModule } from './reward-service/reward-service.module';
import { RedisModule } from '@liaoliaots/nestjs-redis';

import { getRedisConfig } from './config/redis.config';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    // CacheModule.registerAsync({
    //   isGlobal:true,
    //   useFactory: async () => {
    //     const store = await redisStore({
    //       socket: {
    //         host: 'localhost',
    //         port: 6379,
    //       },
    //     });
    //     return {
    //       store: ()=> store as unknown as CacheStore,
    //     };
    //   },
    // }),
    RedisModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getRedisConfig,
      inject: [ConfigService],
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: getDatabaseConfig,
      inject: [ConfigService],
    }),
    ScheduleModule.forRoot(),
    UsersModule,
    PlayersModule,
    LeaderboardModule,
    RewardServiceModule,
  ],
  controllers: [AppController],
  providers: [AppService, RewardServiceService],
})
export class AppModule {}
