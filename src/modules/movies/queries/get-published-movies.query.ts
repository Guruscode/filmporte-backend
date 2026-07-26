import { MovieFilterDto } from '../dto/movie-filter.dto';

export class GetPublishedMoviesQuery {
  constructor(public readonly filter: MovieFilterDto) {}
}