import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  JoinColumn,
  ManyToOne,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Player } from '../../players/entities/player.entity';

@Entity('leaderboard')
export class Leaderboard {
  @ApiProperty({
    description: 'The unique identifier of the leaderboard entry',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The player name',
    example: 'ProGamer123',
  })
  @Column({
    name: 'player_name',
    type: 'varchar',
    length: 50,
    nullable: true,
  })
  playerName: string;

  @ApiProperty({
    description: 'The money amount',
    example: 1000.0,
    default: 0,
  })
  @Column({
    type: 'decimal',
    precision: 20,
    scale: 2,
    default: 0,
    transformer: {
      to(value: number): number {
        return value;
      },
      from(value: string): number {
        return parseFloat(value);
      },
    },
  })
  money: number;

  @ApiProperty({
    description: 'Week number',
    example: 1,
  })
  @Column({
    name: 'week_number',
    type: 'integer',
  })
  weekNumber: number;

  @ApiProperty({
    description: 'Year',
    example: 2024,
  })
  @Column({ type: 'integer' })
  year: number;

  @ManyToOne(() => Player, {
    eager: true,
    onDelete: 'SET NULL',
    nullable: true,
  })
  @JoinColumn({ name: 'player_name', referencedColumnName: 'playerName' })
  player: Player;

  @ApiProperty({
    description: 'Creation timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  @CreateDateColumn({
    name: 'created_at',
    type: 'timestamp with time zone',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Last update timestamp',
    example: '2024-01-01T00:00:00Z',
  })
  @UpdateDateColumn({
    name: 'updated_at',
    type: 'timestamp with time zone',
  })
  updatedAt: Date;
}
