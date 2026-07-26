import { Test, TestingModule } from '@nestjs/testing';
import { QueryBus } from '@nestjs/cqrs';
import { UsersService } from '../users.service';
import { GetMeQuery } from '../queries/get-me.query';

describe('UsersService', () => {
  let service: UsersService;
  let queryBus: jest.Mocked<QueryBus>;

  const mockUser = {
    id: 'user-uuid',
    email: 'john@example.com',
    firstName: 'John',
    lastName: 'Doe',
    role: 'viewer',
    isActive: true,
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockUser),
          },
        },
      ],
    }).compile();

    service = module.get(UsersService);
    queryBus = module.get(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('getMe', () => {
    it('should execute GetMeQuery with the userId', async () => {
      const result = await service.getMe('user-uuid');

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetMeQuery('user-uuid'),
      );
      expect(result).toEqual(mockUser);
    });
  });
});
