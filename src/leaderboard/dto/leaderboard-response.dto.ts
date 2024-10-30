import { ApiProperty } from '@nestjs/swagger';
import { Player } from 'src/players/entities/player.entity';

export class LeaderboardResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  playerName: string;

  @ApiProperty()
  money: number;

  @ApiProperty()
  weekNumber: number;

  @ApiProperty()
  year: number;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;

  @ApiProperty({ type: () => Player })
  player?: Player;
}
