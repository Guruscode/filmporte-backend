import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import {
  NotFoundException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { v4 as uuidv4 } from 'uuid';
import { PurchaseTicketCommand } from '../commands/purchase-ticket.command';
import { Purchase } from '../entities/purchase.entity';
import { Movie } from '../../movies/entities/movie.entity';

@CommandHandler(PurchaseTicketCommand)
export class PurchaseTicketHandler implements ICommandHandler<PurchaseTicketCommand> {
  constructor(
    @InjectRepository(Purchase)
    private readonly purchaseRepository: Repository<Purchase>,
    @InjectRepository(Movie)
    private readonly movieRepository: Repository<Movie>,
  ) {}

  async execute(command: PurchaseTicketCommand): Promise<Purchase> {
    const { movieId, viewerId } = command;

    // 1. Check movie exists and is published
    const movie = await this.movieRepository.findOne({
      where: { id: movieId },
    });

    if (!movie) {
      throw new NotFoundException('Movie not found');
    }

    if (!movie.isPublished) {
      throw new BadRequestException('Movie is not published yet');
    }

    // 2. Prevent buying the same movie twice
    const existingPurchase = await this.purchaseRepository.findOne({
      where: { viewerId, movieId },
    });

    if (existingPurchase) {
      throw new ConflictException('You have already purchased this movie');
    }

    // 3. Create purchase
    const purchase = this.purchaseRepository.create({
      viewerId,
      movieId,
      amountPaid: movie.ticketPrice,
      transactionReference: `TXN-${uuidv4()}`,
    });

    return this.purchaseRepository.save(purchase);
  }
}
