import { ApiProperty } from '@nestjs/swagger';
import { Rank } from '../../common/rank.enum';
import { User } from '../../users/entities/user.entity';
import { Leaderboard } from '../../leaderboard/entities/leaderboard.entity';

export class PlayerResponseDto {
  @ApiProperty({
    description: 'The unique identifier of the player',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'The name of the player',
    example: 'John Doe',
  })
  playerName: string;

  @ApiProperty({
    description: 'The rank of the player',
    enum: Rank,
    example: Rank.Bronze,
  })
  playerRank: Rank;

  @ApiProperty({
    description: 'The money amount of the player',
    example: 1000.0,
  })
  money: number;

  @ApiProperty({
    description: 'The user who owns this player',
    type: User,
  })
  user: User;

  @ApiProperty({
    description: 'The UUID of the user who owns this player',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  userId: string;

  @ApiProperty({
    description: 'The creation date of the player',
    example: '2024-10-28T10:00:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The last update date of the player',
    example: '2024-10-28T10:00:00Z',
  })
  updatedAt: Date;
}
