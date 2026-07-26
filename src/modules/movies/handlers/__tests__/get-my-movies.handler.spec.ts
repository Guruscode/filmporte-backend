import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetMyMoviesHandler } from '../get-my-movies.handler';
import { GetMyMoviesQuery } from '../../queries/get-my-movies.query';
import { Movie } from '../../entities/movie.entity';
import { MovieFilterDto } from '../../dto/movie-filter.dto';

describe('GetMyMoviesHandler', () => {
  let handler: GetMyMoviesHandler;
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
      isPublished: false,
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
        GetMyMoviesHandler,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            createQueryBuilder: jest.fn().mockReturnValue(queryBuilder),
          },
        },
      ],
    }).compile();

    handler = module.get(GetMyMoviesHandler);
    movieRepository = module.get(getRepositoryToken(Movie));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should return paginated movies for the producer', async () => {
    const filter = new MovieFilterDto();
    const query = new GetMyMoviesQuery('producer-uuid', filter);

    const result = await handler.execute(query);

    expect(movieRepository.createQueryBuilder).toHaveBeenCalledWith('movie');
    expect(queryBuilder.where).toHaveBeenCalledWith(
      'movie.producerId = :producerId',
      { producerId: 'producer-uuid' },
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
    const query = new GetMyMoviesQuery('producer-uuid', filter);

    await handler.execute(query);

    expect(queryBuilder.andWhere).toHaveBeenCalledWith(
      '(movie.title ILIKE :search OR movie.description ILIKE :search)',
      { search: '%inception%' },
    );
  });

  it('should return empty result when producer has no movies', async () => {
    queryBuilder.getManyAndCount.mockResolvedValue([[], 0]);

    const filter = new MovieFilterDto();
    const query = new GetMyMoviesQuery('producer-uuid', filter);

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

  it('should respect custom page and limit', async () => {
    const filter = new MovieFilterDto();
    filter.page = 2;
    filter.limit = 5;
    const query = new GetMyMoviesQuery('producer-uuid', filter);

    const result = await handler.execute(query);

    expect(queryBuilder.skip).toHaveBeenCalledWith(5); // (2-1)*5
    expect(queryBuilder.take).toHaveBeenCalledWith(5);
    expect(result.meta.page).toBe(2);
    expect(result.meta.limit).toBe(5);
  });
});
