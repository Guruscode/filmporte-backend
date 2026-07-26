import { IQueryHandler, QueryHandler } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { GetProducerPurchasesQuery } from '../queries/get-producer-purchases.query';
import { Purchase } from '../entities/purchase.entity';

@QueryHandler(GetProducerPurchasesQuery)
export class GetProducerPurchasesHandler implements IQueryHandler<GetProducerPurchasesQuery> {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
  ) {}

  async execute(query: GetProducerPurchasesQuery) {
    const { producerId, filter } = query;
    const page = filter.page || 1;
    const limit = filter.limit || 10;
    const skip = (page - 1) * limit;

    const qb = this.purchaseRepository
      .createQueryBuilder('purchase')
      .innerJoinAndSelect('purchase.movie', 'movie')
      .innerJoinAndSelect('purchase.viewer', 'viewer')
      .where('movie.producerId = :producerId', { producerId });

    const [data, total] = await qb
      .orderBy('purchase.purchaseDate', 'DESC')
      .skip(skip)
      .take(limit)
      .getManyAndCount();

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
