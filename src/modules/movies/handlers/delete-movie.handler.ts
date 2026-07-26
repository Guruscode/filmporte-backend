import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DeleteMovieCommand } from '../commands/delete-movie.command';
import { Movie } from '../entities/movie.entity';

@CommandHandler(DeleteMovieCommand)
export class DeleteMovieHandler implements ICommandHandler<DeleteMovieCommand> {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async execute(command: DeleteMovieCommand): Promise<void> {
    const { movieId, producerId } = command;

    const movie = await this.movieRepository.findOne({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    if (movie.producerId !== producerId) {
      throw new ForbiddenException('You can only delete your own movies');
    }

    await this.movieRepository.remove(movie);
  }
}