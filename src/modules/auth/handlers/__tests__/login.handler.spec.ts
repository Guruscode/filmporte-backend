import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { LoginHandler } from '../login.handler';
import { LoginCommand } from '../../commands/login.command';
import { User, UserRole } from '../../../users/entities/user.entity';

jest.mock('bcrypt', () => ({
  compare: jest.fn(),
}));

import * as bcrypt from 'bcrypt';

describe('LoginHandler', () => {
  let handler: LoginHandler;
  let userRepository: jest.Mocked<Repository<User>>;
  let jwtService: jest.Mocked<JwtService>;

  const mockUser: Partial<User> = {
    id: 'user-uuid-123',
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
        LoginHandler,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('fake-jwt-token'),
          },
        },
      ],
    }).compile();

    handler = module.get(LoginHandler);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should login successfully with correct credentials', async () => {
    userRepository.findOne.mockResolvedValue(mockUser as User);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const command = new LoginCommand({
      email: 'john@example.com',
      password: 'StrongPass123!',
    });

    const result = await handler.execute(command);

    expect(result).toEqual({
      accessToken: 'fake-jwt-token',
      user: {
        id: mockUser.id,
        email: mockUser.email,
        firstName: mockUser.firstName,
        lastName: mockUser.lastName,
        role: mockUser.role,
      },
    });
    expect(jwtService.sign).toHaveBeenCalled();
  });

  it('should throw UnauthorizedException if user does not exist', async () => {
    userRepository.findOne.mockResolvedValue(null);

    const command = new LoginCommand({
      email: 'wrong@example.com',
      password: 'password',
    });

    await expect(handler.execute(command)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if password is incorrect', async () => {
    userRepository.findOne.mockResolvedValue(mockUser as User);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    const command = new LoginCommand({
      email: 'john@example.com',
      password: 'wrong-password',
    });

    await expect(handler.execute(command)).rejects.toThrow(
      UnauthorizedException,
    );
  });

  it('should throw UnauthorizedException if account is deactivated', async () => {
    userRepository.findOne.mockResolvedValue({
      ...mockUser,
      isActive: false,
    } as User);
    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    const command = new LoginCommand({
      email: 'john@example.com',
      password: 'StrongPass123!',
    });

    await expect(handler.execute(command)).rejects.toThrow(
      UnauthorizedException,
    );
  });
});
