import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { DataSource } from 'typeorm';

@ApiTags('Health')
@Controller({ path: 'health', version: '1' })
export class HealthController {
  private readonly startTime: number;

  constructor(private readonly dataSource: DataSource) {
    this.startTime = Date.now();
  }

  @Get()
  @ApiOperation({ summary: 'Health check endpoint' })
  @ApiResponse({ status: 200, description: 'Service is healthy' })
  @ApiResponse({ status: 503, description: 'Database is unreachable' })
  async check() {
    let dbStatus: string;

    try {
      await this.dataSource.query('SELECT 1');
      dbStatus = 'connected';
    } catch {
      dbStatus = 'disconnected';
    }

    const body = {
      status: dbStatus === 'connected' ? 'ok' : 'degraded',
      database: dbStatus,
      timestamp: new Date().toISOString(),
      uptime: Math.floor((Date.now() - this.startTime) / 1000),
    };

    if (dbStatus !== 'connected') {
      throw new ServiceUnavailableException(body);
    }

    return body;
  }
}
