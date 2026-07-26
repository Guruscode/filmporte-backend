import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus } from '@nestjs/cqrs';
import { AuthService } from '../auth.service';
import { RegisterCommand } from '../commands/register.command';
import { LoginCommand } from '../commands/login.command';
import { RegisterDto } from '../dto/register.dto';
import { LoginDto } from '../dto/login.dto';
import { UserRole } from '../../users/entities/user.entity';

describe('AuthService', () => {
  let service: AuthService;
  let commandBus: jest.Mocked<CommandBus>;

  const mockAuthResponse = {
    accessToken: 'fake-jwt-token',
    user: {
      id: 'user-uuid',
      email: 'john@example.com',
      firstName: 'John',
      lastName: 'Doe',
      role: UserRole.VIEWER,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockAuthResponse),
          },
        },
      ],
    }).compile();

    service = module.get(AuthService);
    commandBus = module.get(CommandBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should execute RegisterCommand and return auth response', async () => {
      const dto: RegisterDto = {
        email: 'john@example.com',
        password: 'StrongPass123!',
        firstName: 'John',
        lastName: 'Doe',
        role: UserRole.VIEWER,
      };

      const result = await service.register(dto);

      expect(commandBus.execute).toHaveBeenCalledWith(new RegisterCommand(dto));
      expect(result).toEqual(mockAuthResponse);
    });
  });

  describe('login', () => {
    it('should execute LoginCommand and return auth response', async () => {
      const dto: LoginDto = {
        email: 'john@example.com',
        password: 'StrongPass123!',
      };

      const result = await service.login(dto);

      expect(commandBus.execute).toHaveBeenCalledWith(new LoginCommand(dto));
      expect(result).toEqual(mockAuthResponse);
    });
  });
});
