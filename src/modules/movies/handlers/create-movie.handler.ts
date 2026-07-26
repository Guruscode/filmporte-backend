import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateMovieCommand } from '../commands/create-movie.command';
import { Movie } from '../entities/movie.entity';

@CommandHandler(CreateMovieCommand)
export class CreateMovieHandler implements ICommandHandler<CreateMovieCommand> {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async execute(command: CreateMovieCommand): Promise<Movie> {
    const { dto, producerId } = command;

    const movie = this.movieRepository.create({
      ...dto,
      producerId,
      isPublished: dto.isPublished ?? false,
    });

    return this.movieRepository.save(movie);
  }
}