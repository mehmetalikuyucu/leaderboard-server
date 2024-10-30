import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsNotEmpty, IsString, IsUUID, Matches } from 'class-validator';
import { Rank } from '../../common/rank.enum';

export class CreatePlayerDto {
  @ApiProperty({
    description: 'The name of the player',
    example: 'John_Doe',
    minLength: 2,
    maxLength: 50,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]*$/, {
    message: 'Player name must contain only letters, numbers or underscores',
  })
  playerName: string;

  @ApiProperty({
    description: 'The rank of the player',
    enum: Rank,
    example: Rank.Bronze,
  })
  @IsEnum(Rank)
  @IsNotEmpty()
  playerRank: Rank;

  @ApiProperty({
    description: 'The UUID of the user who owns this player',
    example: '123e4567-e89b-12d3-a456-426614174000',
    format: 'uuid',
  })
  @IsUUID()
  @IsNotEmpty()
  userId: string;
}
