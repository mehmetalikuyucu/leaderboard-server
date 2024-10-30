import { Module } from '@nestjs/common';
import { PlayersService } from './players.service';
import { PlayersController } from './players.controller';
import { Type } from 'class-transformer';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/users/entities/user.entity';
import { Player } from './entities/player.entity';
import { LeaderboardModule } from 'src/leaderboard/leaderboard.module';

@Module({
  imports: [TypeOrmModule.forFeature([Player, User]),LeaderboardModule],
  controllers: [PlayersController],
  providers: [PlayersService],
  exports: [PlayersService,TypeOrmModule],
})
export class PlayersModule {}
