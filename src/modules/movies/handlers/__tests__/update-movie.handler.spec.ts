import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { UpdateMovieHandler } from '../update-movie.handler';
import { UpdateMovieCommand } from '../../commands/update-movie.command';
import { Movie } from '../../entities/movie.entity';

describe('UpdateMovieHandler', () => {
  let handler: UpdateMovieHandler;
  let movieRepository: jest.Mocked<Repository<Movie>>;

  const mockMovie: Partial<Movie> = {
    id: 'movie-uuid',
    title: 'Inception',
    description: 'Old description',
    ticketPrice: 12.5,
    isPublished: false,
    producerId: 'producer-uuid',
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UpdateMovieHandler,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            findOne: jest.fn(),
            save: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(UpdateMovieHandler);
    movieRepository = module.get(getRepositoryToken(Movie));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should update a movie successfully when user is the owner', async () => {
    movieRepository.findOne.mockResolvedValue(mockMovie as Movie);
    movieRepository.save.mockResolvedValue({
      ...mockMovie,
      title: 'Inception Updated',
    } as Movie);

    const command = new UpdateMovieCommand(
      'movie-uuid',
      { title: 'Inception Updated' },
      'producer-uuid',
    );

    const result = await handler.execute(command);

    expect(result.title).toBe('Inception Updated');
    expect(movieRepository.save).toHaveBeenCalled();
  });

  it('should throw NotFoundException if movie does not exist', async () => {
    movieRepository.findOne.mockResolvedValue(null);

    const command = new UpdateMovieCommand(
      'invalid-id',
      { title: 'Updated' },
      'producer-uuid',
    );

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
  });

  it('should throw ForbiddenException if user is not the owner', async () => {
    movieRepository.findOne.mockResolvedValue(mockMovie as Movie);

    const command = new UpdateMovieCommand(
      'movie-uuid',
      { title: 'Updated' },
      'another-producer-uuid', // different owner
    );

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
    expect(movieRepository.save).not.toHaveBeenCalled();
  });
});
