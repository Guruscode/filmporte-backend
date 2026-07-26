import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { Repository } from 'typeorm';
import { PurchaseTicketHandler } from '../purchase-ticket.handler';
import { PurchaseTicketCommand } from '../../commands/purchase-ticket.command';
import { Purchase } from '../../entities/purchase.entity';
import { Movie } from '../../../movies/entities/movie.entity';

jest.mock('uuid', () => ({
  v4: jest.fn(() => 'mock-uuid-transaction-ref'),
}));

describe('PurchaseTicketHandler', () => {
  let handler: PurchaseTicketHandler;
  let purchaseRepository: jest.Mocked<Repository<Purchase>>;
  let movieRepository: jest.Mocked<Repository<Movie>>;

  const mockMovie: Partial<Movie> = {
    id: 'movie-uuid',
    title: 'Inception',
    ticketPrice: 15.5,
    isPublished: true,
    producerId: 'producer-uuid',
  };

  const mockPurchase: Partial<Purchase> = {
    id: 'purchase-uuid',
    viewerId: 'viewer-uuid',
    movieId: 'movie-uuid',
    amountPaid: 15.5,
    transactionReference: 'TXN-123',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PurchaseTicketHandler,
        {
          provide: getRepositoryToken(Purchase),
          useValue: {
            findOne: jest.fn(),
            create: jest.fn(),
            save: jest.fn(),
          },
        },
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(PurchaseTicketHandler);
    purchaseRepository = module.get(getRepositoryToken(Purchase));
    movieRepository = module.get(getRepositoryToken(Movie));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should purchase a ticket successfully', async () => {
    movieRepository.findOne.mockResolvedValue(mockMovie as Movie);
    purchaseRepository.findOne.mockResolvedValue(null);
    purchaseRepository.create.mockReturnValue(mockPurchase as Purchase);
    purchaseRepository.save.mockResolvedValue(mockPurchase as Purchase);

    const command = new PurchaseTicketCommand('movie-uuid', 'viewer-uuid');
    const result = await handler.execute(command);

    expect(result).toEqual(mockPurchase);
    expect(purchaseRepository.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if movie does not exist', async () => {
    movieRepository.findOne.mockResolvedValue(null);

    const command = new PurchaseTicketCommand('invalid-id', 'viewer-uuid');

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw BadRequestException if movie is not published', async () => {
    movieRepository.findOne.mockResolvedValue({
      ...mockMovie,
      isPublished: false,
    } as Movie);

    const command = new PurchaseTicketCommand('movie-uuid', 'viewer-uuid');

    await expect(handler.execute(command)).rejects.toThrow(BadRequestException);
  });

  it('should throw ConflictException if user already purchased the movie', async () => {
    movieRepository.findOne.mockResolvedValue(mockMovie as Movie);
    purchaseRepository.findOne.mockResolvedValue(mockPurchase as Purchase);

    const command = new PurchaseTicketCommand('movie-uuid', 'viewer-uuid');

    await expect(handler.execute(command)).rejects.toThrow(ConflictException);
  });
});
