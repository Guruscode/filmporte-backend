import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { CreateMovieCommand } from './commands/create-movie.command';
import { UpdateMovieCommand } from './commands/update-movie.command';
import { DeleteMovieCommand } from './commands/delete-movie.command';
import { GetMyMoviesQuery } from './queries/get-my-movies.query';
import { GetPublishedMoviesQuery } from './queries/get-published-movies.query';
import { GetMovieByIdQuery } from './queries/get-movie-by-id.query';
import { CreateMovieDto } from './dto/create-movie.dto';
import { UpdateMovieDto } from './dto/update-movie.dto';
import { MovieFilterDto } from './dto/movie-filter.dto';

@Injectable()
export class MoviesService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  create(dto: CreateMovieDto, producerId: string) {
    return this.commandBus.execute(new CreateMovieCommand(dto, producerId));
  }

  update(movieId: string, dto: UpdateMovieDto, producerId: string) {
    return this.commandBus.execute(
      new UpdateMovieCommand(movieId, dto, producerId),
    );
  }

  delete(movieId: string, producerId: string) {
    return this.commandBus.execute(
      new DeleteMovieCommand(movieId, producerId),
    );
  }

  getMyMovies(producerId: string, filter: MovieFilterDto) {
    return this.queryBus.execute(new GetMyMoviesQuery(producerId, filter));
  }

  getPublishedMovies(filter: MovieFilterDto) {
    return this.queryBus.execute(new GetPublishedMoviesQuery(filter));
  }

  getMovieById(movieId: string) {
    return this.queryBus.execute(new GetMovieByIdQuery(movieId));
  }
}