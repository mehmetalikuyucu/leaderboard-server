import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  OneToOne,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';
import { Country } from '../../common/country.enum';
import { ApiProperty } from '@nestjs/swagger';
import { Player } from '../../players/entities/player.entity';

@Entity('users')
export class User {
  @ApiProperty({
    description: 'Unique identifier of the user',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Unique username of the user',
    example: 'john_doe',
  })
  @Column({ unique: true })
  username: string;

  @ApiProperty({
    description: 'First name of the user',
    example: 'John',
  })
  @Column()
  name: string;

  @ApiProperty({
    description: 'Last name of the user',
    example: 'Doe',
  })
  @Column()
  surname: string;

  @ApiProperty({
    description: 'Country of the user',
    enum: Country,
    example: Country.TR,
  })
  @Column({
    type: 'enum',
    enum: Country,
  })
  country: Country;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  @CreateDateColumn()
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  @UpdateDateColumn()
  updatedAt: Date;

  @OneToOne(() => Player, (player) => player.user)
  player: Player;
}
