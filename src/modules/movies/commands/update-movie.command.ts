import { UpdateMovieDto } from '../dto/update-movie.dto';

export class UpdateMovieCommand {
  constructor(
    public readonly movieId: string,
    public readonly dto: UpdateMovieDto,
    public readonly producerId: string,
  ) {}
}