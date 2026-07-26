export class PurchaseTicketCommand {
  constructor(
    public readonly movieId: string,
    public readonly viewerId: string,
  ) {}
}