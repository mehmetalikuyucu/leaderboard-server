import { Controller, Get, Query } from '@nestjs/common';
import { LeaderboardService } from './leaderboard.service';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiQuery,
} from '@nestjs/swagger';
@ApiTags('leaderboard')
@ApiBearerAuth()
@Controller('leaderboard')
export class LeaderboardController {
  constructor(private readonly leaderboardService: LeaderboardService) {}

  @Get('top')
  @ApiOperation({ summary: 'Get top players ' })
  @ApiResponse({
    status: 200,
    description: 'Returns the top players list',
    schema: {
      type: 'array',
      items: {
        type: 'object',
        properties: {
          playerName: { type: 'string' },
          score: { type: 'number' },
          rank: { type: 'number' },
          details: {
            type: 'object',
            properties: {
              playerName: { type: 'string' },
              money: { type: 'string' },
              rank: { type: 'string' },
              country: { type: 'string' },
              userId: { type: 'string' },
              username: { type: 'string' },
              name: { type: 'string' },
              surname: { type: 'string' },
            },
          },
        },
      },
    },
  })
  async getTopPlayers() {
    return this.leaderboardService.getTopPlayers();
  }

  @Get('search')
  @ApiOperation({
    summary: 'Search player in leaderboard with context',
    description:
      'Returns top 100 players plus context around the searched player. If player is beyond rank 100, returns 3 players above and 2 below the searched player.',
  })
  @ApiResponse({
    status: 200,
    description: 'Returns leaderboard entries with player context',
    schema: {
      type: 'object',
      properties: {
        message: { type: 'string' },
        data: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              playerName: { type: 'string' },
              score: { type: 'number' },
              rank: { type: 'number' },
              details: {
                type: 'object',
                properties: {
                  playerName: { type: 'string' },
                  money: { type: 'string' },
                  rank: { type: 'string' },
                  country: { type: 'string' },
                  userId: { type: 'string' },
                  username: { type: 'string' },
                  name: { type: 'string' },
                  surname: { type: 'string' },
                },
              },
            },
          },
        },
      },
    },
  })
  @ApiQuery({
    name: 'playerName',
    description: 'Name of the player to search for',
    required: false,
  })
  async searchPlayerWithContext(@Query('playerName') playerName: string) {
    const results =
      await this.leaderboardService.getPlayerRangeWithContext(playerName);
    return results;
  }

  @Get('prize-pool')
  @ApiOperation({ summary: 'Get the prize pool for the current week' })
  @ApiResponse({
    status: 200,
    description: 'Returns the prize pool for the current week',
    schema: {
      type: 'number',
    },
  })
  async getPrizePool() {
    return this.leaderboardService.getCalculatedPrizePool();
  }
}
