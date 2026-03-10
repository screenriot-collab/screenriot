import { Controller, Get, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '.prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { AdminStatsService, DashboardStatsDto } from './admin-stats.service';

@ApiTags('admin-stats')
@Controller('admin/stats')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.admin, UserRole.manager)
export class AdminStatsController {
  constructor(private readonly stats: AdminStatsService) {}

  @Get()
  getStats(): Promise<DashboardStatsDto> {
    return this.stats.getStats();
  }
}
