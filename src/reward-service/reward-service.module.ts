import { Module } from '@nestjs/common';

import { LeaderboardModule } from 'src/leaderboard/leaderboard.module';
import { RewardServiceService } from './reward-service.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Player } from 'src/players/entities/player.entity';
import { PlayersModule } from 'src/players/players.module';

@Module({
    imports: [
        LeaderboardModule,
        TypeOrmModule.forFeature([Player]),
        PlayersModule,
        LeaderboardModule
    ],
    controllers: [],
    providers: [RewardServiceService],
    exports: [RewardServiceService],
})
export class RewardServiceModule {}
