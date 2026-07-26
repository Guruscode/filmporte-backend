import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetMovieByIdQuery } from '../queries/get-movie-by-id.query';
import { Movie } from '../entities/movie.entity';

@QueryHandler(GetMovieByIdQuery)
export class GetMovieByIdHandler implements IQueryHandler<GetMovieByIdQuery> {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async execute(query: GetMovieByIdQuery): Promise<Movie> {
    const movie = await this.movieRepository.findOne({
      where: { id: query.movieId },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    return movie;
  }
}
