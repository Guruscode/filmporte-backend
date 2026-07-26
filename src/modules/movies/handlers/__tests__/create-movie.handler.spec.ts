import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovieHandler } from '../create-movie.handler';
import { CreateMovieCommand } from '../../commands/create-movie.command';
import { Movie } from '../../entities/movie.entity';

describe('CreateMovieHandler', () => {
  let handler: CreateMovieHandler;
  let movieRepository: jest.Mocked<Repository<Movie>>;

  const mockMovie: Partial<Movie> = {
    id: 'movie-uuid',
    title: 'Inception',
    description: 'A mind-bending thriller',
    ticketPrice: 12.5,
    posterUrl: 'https://example.com/poster.jpg',
    isPublished: false,
    producerId: 'producer-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CreateMovieHandler,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(CreateMovieHandler);
    movieRepository = module.get(getRepositoryToken(Movie));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should create a movie successfully', async () => {
    movieRepository.create.mockReturnValue(mockMovie as Movie);
    movieRepository.save.mockResolvedValue(mockMovie as Movie);

    const command = new CreateMovieCommand(
      {
        title: 'Inception',
        description: 'A mind-bending thriller',
        ticketPrice: 12.5,
        posterUrl: 'https://example.com/poster.jpg',
        isPublished: false,
      },
      'producer-uuid',
    );

    const result = await handler.execute(command);

    expect(movieRepository.create).toHaveBeenCalledWith({
      title: 'Inception',
      description: 'A mind-bending thriller',
      ticketPrice: 12.5,
      posterUrl: 'https://example.com/poster.jpg',
      isPublished: false,
      producerId: 'producer-uuid',
    });
    expect(movieRepository.save).toHaveBeenCalled();
    expect(result).toEqual(mockMovie);
  });

  it('should default isPublished to false when not provided', async () => {
    const movieWithoutPublished = { ...mockMovie, isPublished: false };
    movieRepository.create.mockReturnValue(movieWithoutPublished as Movie);
    movieRepository.save.mockResolvedValue(movieWithoutPublished as Movie);

    const command = new CreateMovieCommand(
      {
        title: 'Inception',
        description: 'A mind-bending thriller',
        ticketPrice: 12.5,
      },
      'producer-uuid',
    );

    await handler.execute(command);

    expect(movieRepository.create).toHaveBeenCalledWith(
      expect.objectContaining({
        isPublished: false,
        producerId: 'producer-uuid',
      }),
    );
  });
});
