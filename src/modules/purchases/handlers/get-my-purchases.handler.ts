import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetMyPurchasesQuery } from '../queries/get-my-purchases.query';
import { Purchase } from '../entities/purchase.entity';

@QueryHandler(GetMyPurchasesQuery)
export class GetMyPurchasesHandler
  implements IQueryHandler<GetMyPurchasesQuery>
{
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
  ) {}

  async execute(query: GetMyPurchasesQuery) {
    const { viewerId, filter } = query;
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;
    const [data, total] = await this.purchaseRepository.findAndCount({
      where: { viewerId },
      relations: {
        movie: true,
      },
      order: { purchaseDate: 'DESC' },
      skip,
      take: limit,
    });

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