import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetProducerPurchasesHandler } from '../get-producer-purchases.handler';
import { GetProducerPurchasesQuery } from '../../queries/get-producer-purchases.query';
import { Purchase } from '../../entities/purchase.entity';
import { PurchaseFilterDto } from '../../dto/purchase-filter.dto';

describe('GetProducerPurchasesHandler', () => {
  let handler: GetProducerPurchasesHandler;
  let purchaseRepository: jest.Mocked<Repository<Purchase>>;

  const mockPurchases: Partial<Purchase>[] = [
    {
      id: 'purchase-uuid-1',
      viewerId: 'viewer-uuid',
      movieId: 'movie-uuid',
      amountPaid: 12.5,
      transactionReference: 'TXN-abc',
    },
    {
      id: 'purchase-uuid-2',
      viewerId: 'viewer-uuid-2',
      movieId: 'movie-uuid',
      amountPaid: 15.0,
      transactionReference: 'TXN-def',
    },
  ];

  let queryBuilder: any;

  beforeEach(async () => {
    queryBuilder = {
      innerJoinAndSelect: jest.fn().mockReturnThis(),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([mockPurchases, 2]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetProducerPurchasesHandler,
        {
          provide: getRepositoryToken(Purchase),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
      ],
    }).compile();

    handler = module.get(GetProducerPurchasesHandler);
    purchaseRepository = module.get(getRepositoryToken(Purchase));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated purchases for the producer', async () => {
    const filter = new PurchaseFilterDto();
    const query = new GetProducerPurchasesQuery('producer-uuid', filter);

    const result = await handler.execute(query);

    expect(purchaseRepository.createQueryBuilder).toHaveBeenCalledWith(
      'purchase',
    );
    expect(queryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
      'purchase.movie',
      'movie',
    );
    expect(queryBuilder.innerJoinAndSelect).toHaveBeenCalledWith(
      'purchase.viewer',
      'viewer',
    );
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'movie.producerId = :producerId',
      { producerId: 'producer-uuid' },
    );
    expect(result).toEqual({
      data: mockPurchases,
      meta: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  });

  it('should return empty result when no purchases exist for producer', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const filter = new PurchaseFilterDto();
    const query = new GetProducerPurchasesQuery('producer-uuid', filter);

    const result = await handler.execute(query);

    expect(result).toEqual({
      data: [],
      meta: {
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      },
    });
  });

  it('should respect custom pagination', async () => {
    const filter = new PurchaseFilterDto();
    filter.page = 2;
    filter.limit = 5;
    const query = new GetProducerPurchasesQuery('producer-uuid', filter);

    await handler.execute(query);

    expect(queryBuilder.skip).toHaveBeenCalledWith(5);
    expect(queryBuilder.take).toHaveBeenCalledWith(5);
  });
});
