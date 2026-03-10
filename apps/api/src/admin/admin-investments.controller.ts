import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '.prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  AdminInvestmentsService,
  FilmWithInvestmentsDto,
  DonationRowDto,
} from './admin-investments.service';

@ApiTags('admin-reports')
@Controller('admin/reports/investments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.admin, UserRole.manager)
export class AdminInvestmentsController {
  constructor(private readonly investments: AdminInvestmentsService) {}

  @Get()
  getFilmsWithInvestments(
    @Query('status') status?: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ): Promise<{ films: FilmWithInvestmentsDto[]; total: number }> {
    return this.investments.getFilmsWithInvestments({
      status,
      page: page ? parseInt(page, 10) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    });
  }

  @Get(':filmId/donations')
  getDonationsByFilmId(
    @Param('filmId') filmId: string,
  ): Promise<DonationRowDto[]> {
    return this.investments.getDonationsByFilmId(filmId);
  }
}
