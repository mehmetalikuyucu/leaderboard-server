import {
  BadRequestException,
  Inject,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CreatePlayerDto } from './dto/create-player.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Player } from './entities/player.entity';
import { User } from '../users/entities/user.entity';
import { PlayerResponseDto } from './dto/player-response.dto';

import { LeaderboardService } from 'src/leaderboard/leaderboard.service';
import * as moment from 'moment';

@Injectable()
export class PlayersService {
  constructor(
    @InjectRepository(Player) private playerRepository: Repository<Player>,
    @InjectRepository(User) private userRepository: Repository<User>,
    private leaderboardService: LeaderboardService,
  ) {}

  async create(createPlayerDto: CreatePlayerDto): Promise<PlayerResponseDto> {
    const user = await this.userRepository.findOne({
      where: { id: createPlayerDto.userId },
    });

    if (!user) {
      throw new NotFoundException(
        `User with ID "${createPlayerDto.userId}" not found`,
      );
    }

    const existingPlayer = await this.playerRepository.findOne({
      where: {
        // userId: createPlayerDto.userId,
        playerName: createPlayerDto.playerName,
      },
    });

    if (existingPlayer) {
      throw new BadRequestException('Player name or user already exists');
    }

    const player = this.playerRepository.create({
      ...createPlayerDto,
      money: 0,
    });

    const savedPlayer = await this.playerRepository.save(player);
    return this.toResponseDto(savedPlayer);
  }

  async findAll(): Promise<PlayerResponseDto[]> {
    const players = await this.playerRepository.find({
      relations: ['user'],
    });
    return players.map((player) => this.toResponseDto(player));
  }

  async findOne(id: string): Promise<PlayerResponseDto> {
    const player = await this.playerRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!player) {
      throw new NotFoundException(`Player with ID "${id}" not found`);
    }

    return this.toResponseDto(player);
  }

  async findByUserId(userId: string): Promise<PlayerResponseDto> {
    const player = await this.playerRepository.findOne({
      where: {
        userId,
      },
      relations: ['user'],
    });
    return this.toResponseDto(player);
  }

  async remove(id: string): Promise<void> {
    const result = await this.playerRepository.delete(id);

    if (result.affected === 0) {
      throw new NotFoundException(`Player with ID "${id}" not found`);
    }
  }

  async updateMoney(id: string, amount: number): Promise<PlayerResponseDto> {
    const player = await this.playerRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!player) {
      throw new NotFoundException(`Player with ID "${id}" not found`);
    }
    if (amount < 0) {
      throw new BadRequestException('The Amount should be positive');
    }
    const weekNumber = moment().week();
    const year = moment().year();
    const updatedMoney = player.money + amount;
    player.money = updatedMoney;
    await this.leaderboardService.updateOrCreateLeaderboardEntry(
      player,
      amount,
      weekNumber,
      year,
    );
    const savedPlayer = await this.playerRepository.save(player);
    return this.toResponseDto(savedPlayer);
  }
  async updateMoneyWithoutRedis(
    id: string,
    amount: number,
  ): Promise<PlayerResponseDto> {
    const player = await this.playerRepository.findOne({
      where: { id },
      relations: ['user'],
    });

    if (!player) {
      throw new NotFoundException(`Player with ID "${id}" not found`);
    }
    if (amount < 0) {
      throw new BadRequestException('The Amount should be positive');
    }

    const updatedMoney = player.money + amount;
    player.money = updatedMoney;
    const savedPlayer = await this.playerRepository.save(player);
    return this.toResponseDto(savedPlayer);
  }

  private toResponseDto(player: Player): PlayerResponseDto {
    const responseDto = new PlayerResponseDto();
    responseDto.id = player.id;
    responseDto.playerName = player.playerName;
    responseDto.playerRank = player.rank;
    responseDto.money = player.money;
    // responseDto.userId = player.userId;
    responseDto.user = player.user;
    responseDto.createdAt = player.createdAt;
    responseDto.updatedAt = player.updatedAt;
    return responseDto;
  }
}
