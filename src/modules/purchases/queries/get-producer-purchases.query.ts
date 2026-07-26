import { PurchaseFilterDto } from '../dto/purchase-filter.dto';

export class GetProducerPurchasesQuery {
  constructor(
    public readonly producerId: string,
    public readonly filter: PurchaseFilterDto,
  ) {}
}