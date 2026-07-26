import { ApiProperty } from '@nestjs/swagger';

export class ApiResponseDto<T> {
  @ApiProperty({ example: true })
  success: boolean;

  @ApiProperty()
  data: T;

  @ApiProperty({ example: '2026-07-26T07:15:00.000Z' })
  timestamp: string;
}

export class PaginatedMetaDto {
  @ApiProperty()
  total: number;

  @ApiProperty()
  page: number;

  @ApiProperty()
  limit: number;

  @ApiProperty()
  totalPages: number;
}

export class PaginatedResponseDto<T> {
  @ApiProperty({ isArray: true })
  data: T[];

  @ApiProperty({ type: PaginatedMetaDto })
  meta: PaginatedMetaDto;
}