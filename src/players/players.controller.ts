import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  Delete,
  HttpStatus,
  HttpCode,
  Query,
  ParseUUIDPipe,
} from '@nestjs/common';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';
import { PlayerResponseDto } from './dto/player-response.dto';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
} from '@nestjs/swagger';

@ApiTags('Players')
@Controller('player')
export class PlayersController {
  constructor(private readonly playersService: PlayersService) {}

  @Post()
  @ApiOperation({ summary: 'Create a new player' })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'The player has been successfully created.',
    type: PlayerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Player name already exists or validation failed.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'User not found.',
  })
  async create(
    @Body() createPlayerDto: CreatePlayerDto,
  ): Promise<PlayerResponseDto> {
    return this.playersService.create(createPlayerDto);
  }

  @Get()
  @ApiOperation({ summary: 'Get all players' })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns all players',
    type: [PlayerResponseDto],
  })
  async findAll(): Promise<PlayerResponseDto[]> {
    return this.playersService.findAll();
  }

  @Get(':id')
  @ApiOperation({ summary: 'Get player by id' })
  @ApiParam({
    name: 'id',
    description: 'Player ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the player',
    type: PlayerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Player not found.',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<PlayerResponseDto> {
    return this.playersService.findOne(id);
  }

  @Get('user/:userId')
  @ApiOperation({ summary: 'Get players by user id' })
  @ApiParam({
    name: 'userId',
    description: 'User ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Returns the players for specified user',
    type: [PlayerResponseDto],
  })
  async findByUserId(
    @Param('userId', ParseUUIDPipe) userId: string,
  ): Promise<PlayerResponseDto> {
    return this.playersService.findByUserId(userId);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({ summary: 'Delete a player' })
  @ApiParam({
    name: 'id',
    description: 'Player ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Player successfully deleted.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Player not found.',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    await this.playersService.remove(id);
  }

  @Post(':id/money')
  @ApiOperation({ summary: 'Update player money' })
  @ApiParam({
    name: 'id',
    description: 'Player ID',
    type: 'string',
    format: 'uuid',
  })
  @ApiQuery({
    name: 'amount',
    description: 'Amount to add/subtract (use negative values for subtraction)',
    type: 'number',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Money updated successfully.',
    type: PlayerResponseDto,
  })
  @ApiResponse({
    status: HttpStatus.BAD_REQUEST,
    description: 'Invalid amount or insufficient funds.',
  })
  @ApiResponse({
    status: HttpStatus.NOT_FOUND,
    description: 'Player not found.',
  })
  async updateMoney(
    @Param('id', ParseUUIDPipe) id: string,
    @Query('amount') amount: number,
  ): Promise<PlayerResponseDto> {
    return this.playersService.updateMoney(id, Number(amount));
  }
}
