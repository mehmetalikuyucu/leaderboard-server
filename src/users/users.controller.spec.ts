import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';
import { UserResponseDto } from './dto/user-response.dto';
import { NotFoundException, ConflictException } from '@nestjs/common';
import { Country } from '../common/country.enum';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUser: UserResponseDto = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    username: 'testuser',
    name: 'Test',
    surname: 'User',
    country: Country.TR,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateUserDto: CreateUserDto = {
    username: 'testuser',
    name: 'Test',
    surname: 'User',
    country: Country.TR,
  };

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUsername: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await controller.create(mockCreateUserDto);

      expect(result).toEqual(mockUser);
      expect(service.create).toHaveBeenCalledWith(mockCreateUserDto);
    });

    it('should throw ConflictException when username already exists', async () => {
      mockUsersService.create.mockRejectedValue(
        new ConflictException('Username already exists'),
      );

      await expect(controller.create(mockCreateUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return an array of users', async () => {
      const mockUsers = [mockUser];
      mockUsersService.findAll.mockResolvedValue(mockUsers);

      const result = await controller.findAll();

      expect(result).toEqual(mockUsers);
      expect(service.findAll).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a user by id', async () => {
      mockUsersService.findOne.mockResolvedValue(mockUser);

      const result = await controller.findOne(mockUser.id);

      expect(result).toEqual(mockUser);
      expect(service.findOne).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException when user not found', async () => {
      mockUsersService.findOne.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.findOne('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });
  });

  describe('findByUsername', () => {
    it('should return a user by username', async () => {
      mockUsersService.findByUsername.mockResolvedValue(mockUser);

      const result = await controller.findByUsername(mockUser.username);

      expect(result).toEqual(mockUser);
      expect(service.findByUsername).toHaveBeenCalledWith(mockUser.username);
    });

    it('should throw NotFoundException when username not found', async () => {
      mockUsersService.findByUsername.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(
        controller.findByUsername('non-existent-username'),
      ).rejects.toThrow(NotFoundException);
    });
  });

  describe('remove', () => {
    it('should remove user successfully', async () => {
      mockUsersService.remove.mockResolvedValue(undefined);

      await controller.remove(mockUser.id);

      expect(service.remove).toHaveBeenCalledWith(mockUser.id);
    });

    it('should throw NotFoundException when trying to remove non-existent user', async () => {
      mockUsersService.remove.mockRejectedValue(
        new NotFoundException('User not found'),
      );

      await expect(controller.remove('non-existent-id')).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should throw ConflictException when trying to remove user with active player', async () => {
      mockUsersService.remove.mockRejectedValue(
        new ConflictException('Cannot delete user with active player'),
      );

      await expect(controller.remove(mockUser.id)).rejects.toThrow(
        ConflictException,
      );
    });
  });
});
