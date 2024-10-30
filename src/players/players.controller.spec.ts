import { Test, TestingModule } from '@nestjs/testing';
import { PlayersController } from './players.controller';
import { PlayersService } from './players.service';
import { CreatePlayerDto } from './dto/create-player.dto';

import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Country } from '../common/country.enum';
import { Rank } from '../common/rank.enum';

describe('PlayersController', () => {
  let controller: PlayersController;
  let service: PlayersService;

  const mockUser = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    name: 'Test',
    surname: 'User',
    country: Country.TR,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPlayer = {
    id: '123e4567-e89b-12d3-a456-426614174001',
    playerName: 'TestPlayer',
    playerRank: Rank.Bronze,
    money: 100,
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreatePlayerDto: CreatePlayerDto = {
    playerName: 'TestPlayer',
    playerRank: Rank.Bronze,
    userId: mockUser.id,
  };

  const mockPlayersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUserId: jest.fn(),
    remove: jest.fn(),
    updateMoney: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [PlayersController],
      providers: [
        {
          provide: PlayersService,
          useValue: mockPlayersService,
        },
      ],
    }).compile();

    controller = module.get<PlayersController>(PlayersController);
    service = module.get<PlayersService>(PlayersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new player successfully', async () => {
      mockPlayersService.create.mockResolvedValue(mockPlayer);

      const result = await controller.create(mockCreatePlayerDto);

      expect(service.create).toHaveBeenCalledWith(mockCreatePlayerDto);
      expect(result).toEqual(mockPlayer);
    });

    it('should throw BadRequestException when player name exists', async () => {
      mockPlayersService.create.mockRejectedValue(new BadRequestException());

      await expect(controller.create(mockCreatePlayerDto)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when user not found', async () => {
      mockPlayersService.create.mockRejectedValue(new NotFoundException());

      await expect(controller.create(mockCreatePlayerDto)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findAll', () => {
    it('should return array of players', async () => {
      const players = [mockPlayer];
      mockPlayersService.findAll.mockResolvedValue(players);

      const result = await controller.findAll();

      expect(service.findAll).toHaveBeenCalled();
      expect(result).toEqual(players);
    });
  });

  describe('findOne', () => {
    it('should return a player by id', async () => {
      mockPlayersService.findOne.mockResolvedValue(mockPlayer);

      const result = await controller.findOne(mockPlayer.id);

      expect(service.findOne).toHaveBeenCalledWith(mockPlayer.id);
      expect(result).toEqual(mockPlayer);
    });

    it('should throw NotFoundException when player not found', async () => {
      mockPlayersService.findOne.mockRejectedValue(new NotFoundException());

      await expect(controller.findOne(mockPlayer.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUserId', () => {
    it('should return players for specified user', async () => {
      mockPlayersService.findByUserId.mockResolvedValue([mockPlayer]);

      const result = await controller.findByUserId(mockUser.id);

      expect(service.findByUserId).toHaveBeenCalledWith(mockUser.id);
      expect(result).toEqual([mockPlayer]);
    });
  });

  describe('remove', () => {
    it('should remove player successfully', async () => {
      mockPlayersService.remove.mockResolvedValue(undefined);

      await controller.remove(mockPlayer.id);

      expect(service.remove).toHaveBeenCalledWith(mockPlayer.id);
    });

    it('should throw NotFoundException when player not found', async () => {
      mockPlayersService.remove.mockRejectedValue(new NotFoundException());

      await expect(controller.remove(mockPlayer.id)).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('updateMoney', () => {
    it('should update player money successfully', async () => {
      const updatedPlayer = { ...mockPlayer, money: 200 };
      mockPlayersService.updateMoney.mockResolvedValue(updatedPlayer);

      const amount = 100;
      const result = await controller.updateMoney(mockPlayer.id, amount);

      expect(service.updateMoney).toHaveBeenCalledWith(mockPlayer.id, amount);
      expect(result).toEqual(updatedPlayer);
    });

    it('should throw BadRequestException when money becomes negative', async () => {
      mockPlayersService.updateMoney.mockRejectedValue(
        new BadRequestException(),
      );

      await expect(controller.updateMoney(mockPlayer.id, -200)).rejects.toThrow(
        BadRequestException,
      );
    });

    it('should throw NotFoundException when player not found', async () => {
      mockPlayersService.updateMoney.mockRejectedValue(new NotFoundException());

      await expect(controller.updateMoney(mockPlayer.id, 100)).rejects.toThrow(
        NotFoundException,
      );
    });
  });
});
