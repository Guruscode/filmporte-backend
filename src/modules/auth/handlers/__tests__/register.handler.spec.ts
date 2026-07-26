import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { ConflictException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { RegisterHandler } from '../register.handler';
import { RegisterCommand } from '../../commands/register.command';
import { User, UserRole } from '../../../users/entities/user.entity';

// Mock bcrypt completely
jest.mock('bcrypt', () => ({
  hash: jest.fn().mockResolvedValue('hashed-password'),
  compare: jest.fn(),
}));

describe('RegisterHandler', () => {
  let handler: RegisterHandler;
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
        RegisterHandler,
        {
          provide: getRepositoryToken(User),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: JwtService,
          useValue: {
            sign: jest.fn().mockReturnValue('fake-jwt-token'),
          },
        },
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn().mockReturnValue(12),
          },
        },
      ],
    }).compile();

    handler = module.get(RegisterHandler);
    userRepository = module.get(getRepositoryToken(User));
    jwtService = module.get(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should register a new user successfully', async () => {
    userRepository.findOne.mockResolvedValue(null);
    userRepository.create.mockReturnValue(mockUser as User);
    userRepository.save.mockResolvedValue(mockUser as User);

    const command = new RegisterCommand({
      email: 'john@example.com',
      password: 'StrongPass123!',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.VIEWER,
    });

    const result = await handler.execute(command);

    expect(userRepository.findOne).toHaveBeenCalledWith({
      where: { email: 'john@example.com' },
    });
    expect(userRepository.save).toHaveBeenCalled();
    expect(jwtService.sign).toHaveBeenCalled();
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
  });

  it('should throw ConflictException when email already exists', async () => {
    userRepository.findOne.mockResolvedValue(mockUser as User);

    const command = new RegisterCommand({
      email: 'john@example.com',
      password: 'StrongPass123!',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.VIEWER,
    });

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
    expect(userRepository.save).not.toHaveBeenCalled();
  });
});
