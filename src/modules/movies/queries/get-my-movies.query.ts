import { MovieFilterDto } from '../dto/movie-filter.dto';

export class GetMyMoviesQuery {
  constructor(
    public readonly producerId: string,
    public readonly filter: MovieFilterDto,
  ) {}
}