import { Body, Controller, Get, Param, Post, Query, UseGuards } from '@nestjs/common';
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
import { FulfillDonationDto } from './dto/fulfill-donation.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('admin-reports')
@Controller('admin/reports/investments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.admin, UserRole.manager)
export class AdminInvestmentsController {
  constructor(private readonly investments: AdminInvestmentsService) {}

  @Get()
  getFilmsWithInvestments(
    @Query() pagination: PaginationQueryDto,
    @Query('status') status?: string,
  ): Promise<{ films: FilmWithInvestmentsDto[]; total: number }> {
    return this.investments.getFilmsWithInvestments({
      status,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Post('fulfill')
  fulfillDonation(@Body() dto: FulfillDonationDto) {
    return this.investments.fulfillFromStripe(dto.sessionId);
  }

  @Get(':filmId/donations')
  getDonationsByFilmId(
    @Param('filmId') filmId: string,
  ): Promise<DonationRowDto[]> {
    return this.investments.getDonationsByFilmId(filmId);
  }
}
