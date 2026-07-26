import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { GetMeHandler } from '../get-me.handler';
import { GetMeQuery } from '../../queries/get-me.query';
import { User, UserRole } from '../../entities/user.entity';

describe('GetMeHandler', () => {
  let handler: GetMeHandler;
  let userRepository: jest.Mocked<Repository<User>>;

  const mockUser: Partial<User> = {
    id: 'user-uuid',
    email: 'john@example.com',
    password: 'hashed-password',
    firstName: 'John',
    lastName: 'Doe',
    role: UserRole.VIEWER,
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMeHandler,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(GetMeHandler);
    userRepository = module.get(getRepositoryToken(User));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return the user when found', async () => {
    userRepository.findOne.mockResolvedValue(mockUser as User);

    const query = new GetMeQuery('user-uuid');
    const result = await handler.execute(query);

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'user-uuid' },
    });
    expect(result).toEqual(mockUser);
  });

  it('should throw NotFoundException when user does not exist', async () => {
    userRepository.findOne.mockResolvedValue(null);

    const query = new GetMeQuery('invalid-id');

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });

  it('should return the user even when account is inactive', async () => {
    const inactiveUser = { ...mockUser, isActive: false };
    userRepository.findOne.mockResolvedValue(inactiveUser as User);

    const query = new GetMeQuery('user-uuid');
    const result = await handler.execute(query);

    expect(result.isActive).toBe(false);
    expect(result).toEqual(inactiveUser);
  });
});
