import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MoviesController } from './movies.controller';
import { MoviesService } from './movies.service';
import { Movie } from './entities/movie.entity';

import { CreateMovieHandler } from './handlers/create-movie.handler';
import { UpdateMovieHandler } from './handlers/update-movie.handler';
import { DeleteMovieHandler } from './handlers/delete-movie.handler';
import { GetMyMoviesHandler } from './handlers/get-my-movies.handler';
import { GetPublishedMoviesHandler } from './handlers/get-published-movies.handler';
import { GetMovieByIdHandler } from './handlers/get-movie-by-id.handler';

const CommandHandlers = [
  CreateMovieHandler,
  UpdateMovieHandler,
  DeleteMovieHandler,
];

const QueryHandlers = [
  GetMyMoviesHandler,
  GetPublishedMoviesHandler,
  GetMovieByIdHandler,
];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Movie])],
  controllers: [MoviesController],
  providers: [MoviesService, ...CommandHandlers, ...QueryHandlers],
  exports: [MoviesService],
})
export class MoviesModule {}