import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToOne,
  JoinColumn,
  OneToMany,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Rank } from '../../common/rank.enum';
import { User } from '../../users/entities/user.entity';
import { Leaderboard } from '../../leaderboard/entities/leaderboard.entity';

@Entity('players')
export class Player {
  @ApiProperty({
    description: 'The unique identifier of the player',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'The unique player name',
    example: 'ProGamer123',
    maxLength: 20,
  })
  @Column({
    type: 'varchar',
    length: 20,
    unique: true,
    name: 'player_name',
  })
  playerName: string;

  @ApiProperty({
    description: 'The rank of the player',
    example: Rank.Bronze,
  })
  @Column({
    type: 'enum',
    enum: Rank,
    default: Rank.Bronze,
  })
  rank: Rank;

  @ApiProperty({
    description: 'The amount of money the player has',
    example: 100.0,
    default: 0.0,
  })
  @Column({
    type: 'decimal',
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

  @OneToMany(() => Player, (player) => player.user, {
    cascade: true,
  })
  leaderBoard: Leaderboard;

  @ApiProperty({
    description: 'The associated user ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @Column({ name: 'user_id' })
  userId: string;
  @ApiProperty({
    description: 'The associated user',
    type: () => User,
  })
  @OneToOne(() => User, (user) => user.player)
  @JoinColumn({ name: 'user_id' })
  user: User;

  @ApiProperty({
    description: 'The date when the player was created',
    example: '2024-10-28T08:00:00Z',
  })
  @CreateDateColumn({
    type: 'timestamp with time zone',
    name: 'created_at',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'The date when the player was last updated',
    example: '2024-10-28T08:00:00Z',
  })
  @UpdateDateColumn({
    type: 'timestamp with time zone',
    name: 'updated_at',
  })
  updatedAt: Date;
}
