
import { ApiProperty } from '@nestjs/swagger';
import { Country } from '../../common/country.enum';

export class UserResponseDto {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000'
  })
  id: string;

  @ApiProperty({
    description: 'Username of the user',
    example: 'john_doe'
  })
  username: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John'
  })
  name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe'
  })
  surname: string;

  @ApiProperty({
    description: 'Country of the user',
    enum: Country,
    example: Country.TR
  })
  country: Country;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00Z'
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00Z'
  })
  updatedAt: Date;
}