import { ApiProperty } from '@nestjs/swagger';
import { IsString, IsNumber, IsUUID, Min } from 'class-validator';

export class CreateLeaderboardDto {
  @ApiProperty({
    description: 'The player ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsUUID()
  playerId: string;

  @ApiProperty({
    description: 'The player name',
    example: 'ProGamer123',
  })
  @IsString()
  playerName: string;

  @ApiProperty({
    description: 'The money amount',
    example: 1000.0,
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  money: number;
}