import { ApiProperty } from '@nestjs/swagger';

export class PurchaseResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  viewerId: string;

  @ApiProperty()
  movieId: string;

  @ApiProperty()
  amountPaid: number;

  @ApiProperty()
  transactionReference: string;

  @ApiProperty()
  purchaseDate: Date;
}
