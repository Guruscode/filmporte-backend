import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PurchasesService } from '../purchases.service';
import { PurchaseTicketCommand } from '../commands/purchase-ticket.command';
import { GetMyPurchasesQuery } from '../queries/get-my-purchases.query';
import { GetProducerPurchasesQuery } from '../queries/get-producer-purchases.query';
import { PurchaseFilterDto } from '../dto/purchase-filter.dto';

describe('PurchasesService', () => {
  let service: PurchasesService;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  const mockPurchase = {
    id: 'purchase-uuid',
    viewerId: 'viewer-uuid',
    movieId: 'movie-uuid',
    amountPaid: 15.5,
    transactionReference: 'TXN-abc',
  };

  const mockPaginatedResult = {
    data: [mockPurchase],
    meta: {
      total: 1,
      page: 1,
      limit: 10,
      totalPages: 1,
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchasesService,
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockPurchase),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockPaginatedResult),
          },
        },
      ],
    }).compile();

    service = module.get(PurchasesService);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('purchaseTicket', () => {
    it('should execute PurchaseTicketCommand', async () => {
      const result = await service.purchaseTicket('movie-uuid', 'viewer-uuid');

      expect(commandBus.execute).toHaveBeenCalledWith(
        new PurchaseTicketCommand('movie-uuid', 'viewer-uuid'),
      );
      expect(result).toEqual(mockPurchase);
    });
  });

  describe('getMyPurchases', () => {
    it('should execute GetMyPurchasesQuery', async () => {
      const filter = new PurchaseFilterDto();

      const result = await service.getMyPurchases('viewer-uuid', filter);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetMyPurchasesQuery('viewer-uuid', filter),
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });

  describe('getProducerPurchases', () => {
    it('should execute GetProducerPurchasesQuery', async () => {
      const filter = new PurchaseFilterDto();

      const result = await service.getProducerPurchases(
        'producer-uuid',
        filter,
      );

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetProducerPurchasesQuery('producer-uuid', filter),
      );
      expect(result).toEqual(mockPaginatedResult);
    });
  });
});
