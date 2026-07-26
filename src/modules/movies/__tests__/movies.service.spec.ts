import { Test, TestingModule } from '@nestjs/testing';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { MoviesService } from '../movies.service';
import { CreateMovieCommand } from '../commands/create-movie.command';
import { UpdateMovieCommand } from '../commands/update-movie.command';
import { DeleteMovieCommand } from '../commands/delete-movie.command';
import { GetMyMoviesQuery } from '../queries/get-my-movies.query';
import { GetPublishedMoviesQuery } from '../queries/get-published-movies.query';
import { GetMovieByIdQuery } from '../queries/get-movie-by-id.query';
import { CreateMovieDto } from '../dto/create-movie.dto';
import { UpdateMovieDto } from '../dto/update-movie.dto';
import { MovieFilterDto } from '../dto/movie-filter.dto';

describe('MoviesService', () => {
  let service: MoviesService;
  let commandBus: jest.Mocked<CommandBus>;
  let queryBus: jest.Mocked<QueryBus>;

  const mockMovie = {
    id: 'movie-uuid',
    title: 'Inception',
    description: 'A mind-bending thriller',
    ticketPrice: 12.5,
    isPublished: false,
    producerId: 'producer-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MoviesService,
        {
          provide: CommandBus,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockMovie),
          },
        },
        {
          provide: QueryBus,
          useValue: {
            execute: jest.fn().mockResolvedValue(mockMovie),
          },
        },
      ],
    }).compile();

    service = module.get(MoviesService);
    commandBus = module.get(CommandBus);
    queryBus = module.get(QueryBus);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should execute CreateMovieCommand and return created movie', async () => {
      const dto: CreateMovieDto = {
        title: 'Inception',
        description: 'A mind-bending thriller',
        ticketPrice: 12.5,
      };

      const result = await service.create(dto, 'producer-uuid');

      expect(commandBus.execute).toHaveBeenCalledWith(
        new CreateMovieCommand(dto, 'producer-uuid'),
      );
      expect(result).toEqual(mockMovie);
    });
  });

  describe('update', () => {
    it('should execute UpdateMovieCommand and return updated movie', async () => {
      const dto: UpdateMovieDto = { title: 'Inception Updated' };

      const result = await service.update('movie-uuid', dto, 'producer-uuid');

      expect(commandBus.execute).toHaveBeenCalledWith(
        new UpdateMovieCommand('movie-uuid', dto, 'producer-uuid'),
      );
      expect(result).toEqual(mockMovie);
    });
  });

  describe('delete', () => {
    it('should execute DeleteMovieCommand', async () => {
      const result = await service.delete('movie-uuid', 'producer-uuid');

      expect(commandBus.execute).toHaveBeenCalledWith(
        new DeleteMovieCommand('movie-uuid', 'producer-uuid'),
      );
      expect(result).toEqual(mockMovie);
    });
  });

  describe('getMyMovies', () => {
    it('should execute GetMyMoviesQuery', async () => {
      const filter = new MovieFilterDto();

      const result = await service.getMyMovies('producer-uuid', filter);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetMyMoviesQuery('producer-uuid', filter),
      );
      expect(result).toEqual(mockMovie);
    });
  });

  describe('getPublishedMovies', () => {
    it('should execute GetPublishedMoviesQuery', async () => {
      const filter = new MovieFilterDto();

      const result = await service.getPublishedMovies(filter);

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetPublishedMoviesQuery(filter),
      );
      expect(result).toEqual(mockMovie);
    });
  });

  describe('getMovieById', () => {
    it('should execute GetMovieByIdQuery', async () => {
      const result = await service.getMovieById('movie-uuid');

      expect(queryBus.execute).toHaveBeenCalledWith(
        new GetMovieByIdQuery('movie-uuid'),
      );
      expect(result).toEqual(mockMovie);
    });
  });
});
