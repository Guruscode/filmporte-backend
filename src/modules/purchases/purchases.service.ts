import { Injectable } from '@nestjs/common';
import { CommandBus, QueryBus } from '@nestjs/cqrs';
import { PurchaseTicketCommand } from './commands/purchase-ticket.command';
import { GetMyPurchasesQuery } from './queries/get-my-purchases.query';
import { GetProducerPurchasesQuery } from './queries/get-producer-purchases.query';
import { PurchaseFilterDto } from './dto/purchase-filter.dto';

@Injectable()
export class PurchasesService {
  constructor(
    private readonly commandBus: CommandBus,
    private readonly queryBus: QueryBus,
  ) {}

  purchaseTicket(movieId: string, viewerId: string) {
    return this.commandBus.execute(
      new PurchaseTicketCommand(movieId, viewerId),
    );
  }

  getMyPurchases(viewerId: string, filter: PurchaseFilterDto) {
    return this.queryBus.execute(new GetMyPurchasesQuery(viewerId, filter));
  }

  getProducerPurchases(producerId: string, filter: PurchaseFilterDto) {
    return this.queryBus.execute(
      new GetProducerPurchasesQuery(producerId, filter),
    );
  }
}
