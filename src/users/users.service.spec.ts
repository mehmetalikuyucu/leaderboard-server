import { Repository } from 'typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Test } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { CreateUserDto } from './dto/create-user.dto';

describe('User Service', () => {
  let service: UsersService;
  let repository: Repository<User>;

  const mockUser = {
    id: '1',
    username: 'testuser',
    name: 'Test',
    surname: 'User',
    country: 'TR',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateUser = {
    username: 'testuser',
    name: 'Test',
    surname: 'User',
    country: 'TR',
  };

  const mockUserRepository = {
    find: jest.fn(),
    findOne: jest.fn(),
    create: jest.fn(),
    save: jest.fn(),
    delete: jest.fn(),
  };

  console.log('User Service', service, repository);

  beforeEach(async () => {
    const module = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: mockUserRepository,
        },
      ],
    }).compile();
    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
    console.log('User Service', repository);
  });
  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('Create User', () => {
    it('should succesfully create a user', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      mockUserRepository.create.mockReturnValue(mockUser);
      mockUserRepository.save.mockResolvedValue(mockUser);

      const result = await service.create(mockCreateUser as CreateUserDto);
      console.log('User Service', result);
      expect(repository.create).toHaveBeenCalledWith(mockCreateUser);
      expect(repository.save).toHaveBeenCalled();
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        name: mockUser.name,
        surname: mockUser.surname,
        country: mockUser.country,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });
    it('should throw an error if the user already exists', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);

      await expect(
        service.create(mockCreateUser as CreateUserDto),
      ).rejects.toThrow();
      expect(repository.findOne).toHaveBeenCalledWith({
        where: { username: mockCreateUser.username },
      });
      expect(repository.create).not.toHaveBeenCalled();
      expect(repository.save).not.toHaveBeenCalled();
    });
  });

  describe('Find All Users', () => {
    it('should return an array of users', async () => {
      mockUserRepository.find.mockResolvedValue([mockUser]);
      const result = await service.findAll();
      expect(result).toEqual([
        {
          id: mockUser.id,
          username: mockUser.username,
          name: mockUser.name,
          surname: mockUser.surname,
          country: mockUser.country,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      ]);
    });
  });

  describe('Find One User', () => {
    it('should return a user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findOne(mockUser.id);
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        name: mockUser.name,
        surname: mockUser.surname,
        country: mockUser.country,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });
    it('should throw an error if the user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.findOne('2')).rejects.toThrow();
    });
  });

  describe('Find User By Username', () => {
    it('should return a user', async () => {
      mockUserRepository.findOne.mockResolvedValue(mockUser);
      const result = await service.findByUsername(mockUser.username);
      expect(result).toEqual({
        id: mockUser.id,
        username: mockUser.username,
        name: mockUser.name,
        surname: mockUser.surname,
        country: mockUser.country,
        createdAt: mockUser.createdAt,
        updatedAt: mockUser.updatedAt,
      });
    });
    it('should throw an error if the user does not exist', async () => {
      mockUserRepository.findOne.mockResolvedValue(null);
      await expect(service.findByUsername('test')).rejects.toThrow();
    });
  });
});
