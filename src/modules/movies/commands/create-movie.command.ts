import { CreateMovieDto } from '../dto/create-movie.dto';

export class CreateMovieCommand {
  constructor(
    public readonly dto: CreateMovieDto,
    public readonly producerId: string,
  ) {}
}