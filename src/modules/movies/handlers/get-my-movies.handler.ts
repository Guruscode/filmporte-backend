import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetMyMoviesQuery } from '../queries/get-my-movies.query';
import { Movie } from '../entities/movie.entity';

@QueryHandler(GetMyMoviesQuery)
export class GetMyMoviesHandler implements IQueryHandler<GetMyMoviesQuery> {
  constructor(
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async execute(query: GetMyMoviesQuery) {
    const { producerId, filter } = query;
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.movieRepository
      .createQueryBuilder('movie')
      .where('movie.producerId = :producerId', { producerId });

    if (filter.search) {
      qb.andWhere(
        '(movie.title ILIKE :search OR movie.description ILIKE :search)',
        { search: `%${filter.search}%` },
      );
    }

    const [data, total] = await qb
      .orderBy('movie.createdAt', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }
}
