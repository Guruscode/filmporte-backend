export class DeleteMovieCommand {
  constructor(
    public readonly movieId: string,
    public readonly producerId: string,
  ) {}
}