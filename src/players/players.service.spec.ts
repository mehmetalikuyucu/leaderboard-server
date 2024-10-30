import { Repository } from 'typeorm';
import { PlayersService } from './players.service';
import { Player } from './entities/player.entity';
import { User } from '../users/entities/user.entity';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreatePlayerDto } from './dto/create-player.dto';
import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Country } from '../common/country.enum';

describe('Players Service', () => {
  let service: PlayersService;
  let playerRepository: Repository<Player>;
  let userRepository: Repository<User>;

  const mockUser = {
    id: '1',
    username: 'testuser',
    name: 'Test',
    surname: 'User',
    country: Country.TR,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockPlayer = {
    id: '1',
    playerName: 'Test_Player',
    rank: 'Bronze',
    money: 0,
    userId: mockUser.id,
    user: mockUser,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreatePlayer = {
    playerName: 'Test Player',
    playerRank: 'BRONZE',
    userId: '1',
  };

  const mockPlayerRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  const mockUserRepository = {
    findOne: jest.fn(),
  };

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        PlayersService,
        {
          provide: getRepositoryToken(Player),
          useValue: mockPlayerRepository,
        },
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();

    service = module.get<PlayersService>(PlayersService);
    playerRepository = module.get<Repository<Player>>(
      getRepositoryToken(Player),
    );
    userRepository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create Player', () => {
    it('should successfully create a player', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPlayerRepository.findOne.mockResolvedValue(null);
      mockPlayerRepository.create.mockReturnValue(mockPlayer);
      mockPlayerRepository.save.mockResolvedValue(mockPlayer);

      const result = await service.create(mockCreatePlayer as CreatePlayerDto);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCreatePlayer.userId },
      });
      expect(playerRepository.findOne).toHaveBeenCalledWith({
        where: {
          playerName: mockCreatePlayer.playerName,
        },
      });
      expect(playerRepository.create).toHaveBeenCalledWith({
        ...mockCreatePlayer,
        money: 0,
      });
      expect(playerRepository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockPlayer.id,
        playerName: mockPlayer.playerName,
        playerRank: mockPlayer.rank,
        money: mockPlayer.money,
        user: mockUser,
        createdAt: mockPlayer.createdAt,
        updatedAt: mockPlayer.updatedAt,
      });
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);

      await expect(
        service.create(mockCreatePlayer as CreatePlayerDto),
      ).rejects.toThrow(NotFoundException);

      expect(userRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockCreatePlayer.userId },
      });
      expect(playerRepository.create).not.toHaveBeenCalled();
      expect(playerRepository.save).not.toHaveBeenCalled();
    });

    it('should throw BadRequestException when player already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      mockPlayerRepository.findOne.mockResolvedValue(mockPlayer);

      await expect(
        service.create(mockCreatePlayer as CreatePlayerDto),
      ).rejects.toThrow(BadRequestException);

      expect(playerRepository.create).not.toHaveBeenCalled();
      expect(playerRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Find All Players', () => {
    it('should return an array of players with user information', async () => {
      mockPlayerRepository.find.mockResolvedValue([mockPlayer]);

      const result = await service.findAll();

      expect(playerRepository.find).toHaveBeenCalledWith({
        relations: ['user'],
      });
      expect(result).toEqual([
        {
          id: mockPlayer.id,
          playerName: mockPlayer.playerName,
          playerRank: mockPlayer.rank,
          money: mockPlayer.money,
          user: mockUser,
          createdAt: mockPlayer.createdAt,
          updatedAt: mockPlayer.updatedAt,
        },
      ]);
    });
  });

  describe('Find One Player', () => {
    it('should return a player with user information', async () => {
      mockPlayerRepository.findOne.mockResolvedValue(mockPlayer);

      const result = await service.findOne(mockPlayer.id);

      expect(playerRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPlayer.id },
        relations: ['user'],
      });
      expect(result).toEqual({
        id: mockPlayer.id,
        playerName: mockPlayer.playerName,
        playerRank: mockPlayer.rank,
        money: mockPlayer.money,
        user: mockUser,
        createdAt: mockPlayer.createdAt,
        updatedAt: mockPlayer.updatedAt,
      });
    });

    it('should throw NotFoundException if player not found', async () => {
      mockPlayerRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne('2')).rejects.toThrow(NotFoundException);

      expect(playerRepository.findOne).toHaveBeenCalledWith({
        where: { id: '2' },
        relations: ['user'],
      });
    });
  });

  describe('Find Player By UserId', () => {
    it('should return a player with user information', async () => {
      mockPlayerRepository.findOne.mockResolvedValue(mockPlayer);
      const result = await service.findByUserId(mockUser.id);
      expect(playerRepository.findOne).toHaveBeenCalledWith({
        where: { userId: mockUser.id },
        relations: ['user'],
      });
      expect(result).toEqual({
        id: mockPlayer.id,
        playerName: mockPlayer.playerName,
        playerRank: mockPlayer.rank,
        money: mockPlayer.money,
        user: mockUser,
        createdAt: mockPlayer.createdAt,
        updatedAt: mockPlayer.updatedAt,
      });
    });
  });

  describe('Update Money', () => {
    it('should successfully update player money', async () => {
      const updatedPlayer = { ...mockPlayer, money: 100 };
      mockPlayerRepository.findOne.mockResolvedValue(mockPlayer);
      mockPlayerRepository.save.mockResolvedValue(updatedPlayer);

      const result = await service.updateMoney(mockPlayer.id, 100);

      expect(playerRepository.findOne).toHaveBeenCalledWith({
        where: { id: mockPlayer.id },
        relations: ['user'],
      });
      expect(playerRepository.save).toHaveBeenCalled();
      const { userId, rank, ...player } = updatedPlayer;
      expect(result).toEqual({
        ...player,
        playerRank: updatedPlayer.rank,
      });
    });

    it('should throw BadRequestException when money becomes negative', async () => {
      mockPlayerRepository.findOne.mockResolvedValue(mockPlayer);

      await expect(service.updateMoney(mockPlayer.id, -100)).rejects.toThrow(
        BadRequestException,
      );

      expect(playerRepository.save).not.toHaveBeenCalled();
    });

    it('should throw NotFoundException when player not found', async () => {
      mockPlayerRepository.findOne.mockResolvedValue(null);

      await expect(service.updateMoney('1', 100)).rejects.toThrow(
        NotFoundException,
      );

      expect(playerRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('Remove Player', () => {
    it('should successfully remove a player', async () => {
      mockPlayerRepository.delete.mockResolvedValue({ affected: 1 });

      await service.remove(mockPlayer.id);

      expect(playerRepository.delete).toHaveBeenCalledWith(mockPlayer.id);
    });

    it('should throw NotFoundException when player not found', async () => {
      mockPlayerRepository.delete.mockResolvedValue({ affected: 0 });

      await expect(service.remove('1')).rejects.toThrow(NotFoundException);

      expect(playerRepository.delete).toHaveBeenCalledWith('1');
    });
  });
});
