import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { GetMovieByIdHandler } from '../get-movie-by-id.handler';
import { GetMovieByIdQuery } from '../../queries/get-movie-by-id.query';
import { Movie } from '../../entities/movie.entity';

describe('GetMovieByIdHandler', () => {
  let handler: GetMovieByIdHandler;
  let movieRepository: jest.Mocked<Repository<Movie>>;

  const mockMovie: Partial<Movie> = {
    id: 'movie-uuid',
    title: 'Inception',
    description: 'A mind-bending thriller',
    ticketPrice: 12.5,
    posterUrl: 'https://example.com/poster.jpg',
    isPublished: true,
    producerId: 'producer-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetMovieByIdHandler,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            findOne: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(GetMovieByIdHandler);
    movieRepository = module.get(getRepositoryToken(Movie));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return a movie when it exists', async () => {
    movieRepository.findOne.mockResolvedValue(mockMovie as Movie);

    const query = new GetMovieByIdQuery('movie-uuid');
    const result = await handler.execute(query);

    expect(result).toEqual(mockMovie);
    expect(movieRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'movie-uuid' },
    });
  });

  it('should throw NotFoundException when movie does not exist', async () => {
    movieRepository.findOne.mockResolvedValue(null);

    const query = new GetMovieByIdQuery('invalid-id');

    await expect(handler.execute(query)).rejects.toThrow(NotFoundException);
  });

  it('should return a movie even when it is not published', async () => {
    const unpublishedMovie = { ...mockMovie, isPublished: false };
    movieRepository.findOne.mockResolvedValue(unpublishedMovie as Movie);

    const query = new GetMovieByIdQuery('movie-uuid');
    const result = await handler.execute(query);

    expect(result.isPublished).toBe(false);
    expect(result).toEqual(unpublishedMovie);
  });
});
