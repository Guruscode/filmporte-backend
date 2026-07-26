import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetPublishedMoviesHandler } from '../get-published-movies.handler';
import { GetPublishedMoviesQuery } from '../../queries/get-published-movies.query';
import { Movie } from '../../entities/movie.entity';
import { MovieFilterDto } from '../../dto/movie-filter.dto';

describe('GetPublishedMoviesHandler', () => {
  let handler: GetPublishedMoviesHandler;
  let movieRepository: jest.Mocked<Repository<Movie>>;

  const mockMovies: Partial<Movie>[] = [
    {
      id: 'movie-uuid-1',
      title: 'Inception',
      description: 'A mind-bending thriller',
      ticketPrice: 12.5,
      isPublished: true,
      producerId: 'producer-uuid',
    },
    {
      id: 'movie-uuid-2',
      title: 'Interstellar',
      description: 'A space odyssey',
      ticketPrice: 15.0,
      isPublished: true,
      producerId: 'producer-uuid',
    },
  ];

  let queryBuilder: any;

  beforeEach(async () => {
    queryBuilder = {
      where: jest.fn().mockReturnThis(),
      andWhere: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      skip: jest.fn().mockReturnThis(),
      take: jest.fn().mockReturnThis(),
      getManyAndCount: jest.fn().mockResolvedValue([mockMovies, 2]),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        GetPublishedMoviesHandler,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
      ],
    }).compile();

    handler = module.get(GetPublishedMoviesHandler);
    movieRepository = module.get(getRepositoryToken(Movie));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated published movies', async () => {
    const filter = new MovieFilterDto();
    const query = new GetPublishedMoviesQuery(filter);

    const result = await handler.execute(query);

    expect(movieRepository.createQueryBuilder).toHaveBeenCalledWith('movie');
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'movie.isPublished = :isPublished',
      { isPublished: true },
    );
    expect(result).toEqual({
      data: mockMovies,
      meta: {
        total: 2,
        page: 1,
        limit: 10,
        totalPages: 1,
      },
    });
  });

  it('should apply search filter when provided', async () => {
    const filter = new MovieFilterDto();
    filter.search = 'inception';
    const query = new GetPublishedMoviesQuery(filter);

    await handler.execute(query);

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      '(movie.title ILIKE :search OR movie.description ILIKE :search)',
      { search: '%inception%' },
    );
  });

  it('should return empty result when no published movies exist', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const filter = new MovieFilterDto();
    const query = new GetPublishedMoviesQuery(filter);

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
});
