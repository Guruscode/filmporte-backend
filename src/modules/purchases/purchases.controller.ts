import {
  Controller,
  Get,
  Post,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { PurchasesService } from './purchases.service';
import { PurchaseTicketDto } from './dto/purchase-ticket.dto';
import { PurchaseFilterDto } from './dto/purchase-filter.dto';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { Roles } from '../../common/decorators/roles.decorator';
import { CurrentUser } from '../../common/decorators/current-user.decorator';
import { UserRole } from '../users/entities/user.entity';

@ApiTags('Purchases')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard, RolesGuard)
@Controller({ path: 'purchases', version: '1' })
export class PurchasesController {
  constructor(private readonly purchasesService: PurchasesService) {}

  @Post()
  @Roles(UserRole.VIEWER)
  @ApiOperation({ summary: 'Purchase a ticket for a published movie (Viewer only)' })
  purchaseTicket(
    @Body() dto: PurchaseTicketDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.purchasesService.purchaseTicket(dto.movieId, user.id);
  }

  @Get('my')
  @Roles(UserRole.VIEWER)
  @ApiOperation({ summary: 'View my purchased tickets (Viewer only)' })
  getMyPurchases(
    @CurrentUser() user: { id: string },
    @Query() filter: PurchaseFilterDto,
  ) {
    return this.purchasesService.getMyPurchases(user.id, filter);
  }

  @Get('producer')
  @Roles(UserRole.PRODUCER)
  @ApiOperation({ summary: 'View purchases made on my movies (Producer only)' })
  getProducerPurchases(
    @CurrentUser() user: { id: string },
    @Query() filter: PurchaseFilterDto,
  ) {
    return this.purchasesService.getProducerPurchases(user.id, filter);
  }
}