import { PurchaseFilterDto } from '../dto/purchase-filter.dto';

export class GetMyPurchasesQuery {
  constructor(
    public readonly viewerId: string,
    public readonly filter: PurchaseFilterDto,
  ) {}
}
