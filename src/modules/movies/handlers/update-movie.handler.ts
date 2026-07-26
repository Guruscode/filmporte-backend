import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UpdateMovieCommand } from '../commands/update-movie.command';
import { Movie } from '../entities/movie.entity';

@CommandHandler(UpdateMovieCommand)
export class UpdateMovieHandler implements ICommandHandler<UpdateMovieCommand> {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async execute(command: UpdateMovieCommand): Promise<Movie> {
    const { movieId, dto, producerId } = command;

    const movie = await this.movieRepository.findOne({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    if (movie.producerId !== producerId) {
      throw new ForbiddenException('You can only update your own movies');
    }

    Object.assign(movie, dto);
    return this.movieRepository.save(movie);
  }
}
