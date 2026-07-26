import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { Repository } from 'typeorm';
import { DeleteMovieHandler } from '../delete-movie.handler';
import { DeleteMovieCommand } from '../../commands/delete-movie.command';
import { Movie } from '../../entities/movie.entity';

describe('DeleteMovieHandler', () => {
  let handler: DeleteMovieHandler;
  let movieRepository: jest.Mocked<Repository<Movie>>;

  const mockMovie: Partial<Movie> = {
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
        DeleteMovieHandler,
        {
          provide: getRepositoryToken(Movie),
          useValue: {
            findOne: jest.fn(),
            remove: jest.fn(),
          },
        },
      ],
    }).compile();

    handler = module.get(DeleteMovieHandler);
    movieRepository = module.get(getRepositoryToken(Movie));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should delete a movie successfully when user is the owner', async () => {
    movieRepository.findOne.mockResolvedValue(mockMovie as Movie);
    movieRepository.remove.mockResolvedValue(mockMovie as Movie);

    const command = new DeleteMovieCommand('movie-uuid', 'producer-uuid');

    await handler.execute(command);

    expect(movieRepository.findOne).toHaveBeenCalledWith({
      where: { id: 'movie-uuid' },
    });
    expect(movieRepository.remove).toHaveBeenCalledWith(mockMovie);
  });

  it('should throw NotFoundException if movie does not exist', async () => {
    movieRepository.findOne.mockResolvedValue(null);

    const command = new DeleteMovieCommand('invalid-id', 'producer-uuid');

    await expect(handler.execute(command)).rejects.toThrow(NotFoundException);
    expect(movieRepository.remove).not.toHaveBeenCalled();
  });

  it('should throw ForbiddenException if user is not the owner', async () => {
    movieRepository.findOne.mockResolvedValue(mockMovie as Movie);

    const command = new DeleteMovieCommand(
      'movie-uuid',
      'another-producer-uuid',
    );

    await expect(handler.execute(command)).rejects.toThrow(ForbiddenException);
    expect(movieRepository.remove).not.toHaveBeenCalled();
  });
});
