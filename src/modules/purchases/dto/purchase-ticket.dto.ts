import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsUUID } from 'class-validator';

export class PurchaseTicketDto {
  @ApiProperty({ example: 'uuid-of-the-movie' })
  @IsUUID()
  @IsNotEmpty()
  movieId: string;
}