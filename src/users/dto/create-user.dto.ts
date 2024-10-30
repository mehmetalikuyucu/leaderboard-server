import { IsNotEmpty, IsString, IsEnum, Matches } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Country } from '../../common/country.enum';

export class CreateUserDto {
  @ApiProperty({
    description: 'Unique username for the user',
    example: 'john_doe',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  @Matches(/^[a-zA-Z0-9_]*$/, {
    message: 'Username must contain only letters, numbers or underscores',
  })
  username: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
    required: true,
  })
  @IsNotEmpty()
  @IsString()
  surname: string;

  @ApiProperty({
    description: 'Country of the user',
    enum: Country,
    example: Country.TR,
    required: true,
  })
  @IsNotEmpty()
  @IsEnum(Country)
  country: Country;
}
