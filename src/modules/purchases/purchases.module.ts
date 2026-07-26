import { Module } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PurchasesController } from './purchases.controller';
import { PurchasesService } from './purchases.service';
import { Purchase } from './entities/purchase.entity';
import { Movie } from '../movies/entities/movie.entity';

import { PurchaseTicketHandler } from './handlers/purchase-ticket.handler';
import { GetMyPurchasesHandler } from './handlers/get-my-purchases.handler';
import { GetProducerPurchasesHandler } from './handlers/get-producer-purchases.handler';

const CommandHandlers = [PurchaseTicketHandler];
const QueryHandlers = [GetMyPurchasesHandler, GetProducerPurchasesHandler];

@Module({
  imports: [CqrsModule, TypeOrmModule.forFeature([Purchase, Movie])],
  controllers: [PurchasesController],
  providers: [PurchasesService, ...CommandHandlers, ...QueryHandlers],
})
export class PurchasesModule {}
