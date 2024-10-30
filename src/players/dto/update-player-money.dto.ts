import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsNumber } from 'class-validator';

export class UpdatePlayerMoneyDto {
  @ApiProperty({
    description: 'The amount to add/subtract from player money',
    example: 100.0,
  })
  @IsNumber()
  @IsNotEmpty()
  amount: number;
}
