import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MovieResponseDto {
  @ApiProperty()
  id: string;

  @ApiProperty()
  title: string;

  @ApiProperty()
  description: string;

  @ApiProperty()
  ticketPrice: number;

  @ApiPropertyOptional()
  posterUrl?: string;

  @ApiProperty()
  isPublished: boolean;

  @ApiProperty()
  producerId: string;

  @ApiProperty()
  createdAt: Date;

  @ApiProperty()
  updatedAt: Date;
}
