import { Controller, Get } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';

export interface HealthChecks {
  api: 'ok';
  database: 'ok' | 'error';
  storage: 'ok' | 'error' | 'skipped';
}

export interface HealthResponse {
  status: 'ok' | 'degraded';
  checks: HealthChecks;
}

@ApiTags('health')
@Controller()
export class HealthController {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  @Get('health')
  async getHealth(): Promise<HealthResponse> {
    const checks: HealthChecks = { api: 'ok', database: 'error', storage: 'skipped' };

    try {
      await this.prisma.$queryRaw`SELECT 1`;
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
    }

    if (process.env.S3_ENDPOINT) {
      try {
        await this.s3.ping();
        checks.storage = 'ok';
      } catch {
        checks.storage = 'error';
      }
    }

    const status =
      checks.database === 'ok' && (checks.storage === 'ok' || checks.storage === 'skipped')
        ? 'ok'
        : 'degraded';

    return { status, checks };
  }
}
