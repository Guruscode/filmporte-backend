import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetMyPurchasesHandler } from '../get-my-purchases.handler';
import { GetMyPurchasesQuery } from '../../queries/get-my-purchases.query';
import { Purchase } from '../../entities/purchase.entity';
import { PurchaseFilterDto } from '../../dto/purchase-filter.dto';

describe('GetMyPurchasesHandler', () => {
  let handler: GetMyPurchasesHandler;
  let purchaseRepository: jest.Mocked<Repository<Purchase>>;

  const mockPurchases: Partial<Purchase>[] = [
    {
      id: 'purchase-uuid-1',
      viewerId: 'viewer-uuid',
      movieId: 'movie-uuid-1',
      amountPaid: 12.5,
      transactionReference: 'TXN-abc',
    },
    {
      id: 'purchase-uuid-2',
      viewerId: 'viewer-uuid',
      movieId: 'movie-uuid-2',
      amountPaid: 15.0,
      transactionReference: 'TXN-def',
    },
  ];

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMyPurchasesHandler,
        {
          provide: getRepositoryToken(Purchase),
          useValue: {
            findAndCount: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(GetMyPurchasesHandler);
    purchaseRepository = module.get(getRepositoryToken(Purchase));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated purchases for the viewer', async () => {
    purchaseRepository.findAndCount.mockResolvedValue([
      mockPurchases as Purchase[],
      2,
    ]);

    const filter = new PurchaseFilterDto();
    const query = new GetMyPurchasesQuery('viewer-uuid', filter);

    const result = await handler.execute(query);

    expect(purchaseRepository.findAndCount).toHaveBeenCalledWith({
      where: { viewerId: 'viewer-uuid' },
      relations: { movie: true },
      order: { purchaseDate: 'DESC' },
      skip: 0,
      take: 10,
    });
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

  it('should return empty result when viewer has no purchases', async () => {
    purchaseRepository.findAndCount.mockResolvedValue([[], 0]);

    const filter = new PurchaseFilterDto();
    const query = new GetMyPurchasesQuery('viewer-uuid', filter);

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
    purchaseRepository.findAndCount.mockResolvedValue([
      mockPurchases as Purchase[],
      2,
    ]);

    const filter = new PurchaseFilterDto();
    filter.page = 2;
    filter.limit = 5;
    const query = new GetMyPurchasesQuery('viewer-uuid', filter);

    await handler.execute(query);

    expect(purchaseRepository.findAndCount).toHaveBeenCalledWith(
      expect.objectContaining({
        skip: 5,
        take: 5,
      }),
    );
  });
});
