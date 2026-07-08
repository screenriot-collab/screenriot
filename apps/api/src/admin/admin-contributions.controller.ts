import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { UserRole } from '.prisma/client';
import { AdminContributionsService } from './admin-contributions.service';
import { AdminRejectContributionDto } from './dto/admin-reject-contribution.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.admin, UserRole.manager)
@Controller('admin/contributions')
export class AdminContributionsController {
  constructor(private readonly contributionsService: AdminContributionsService) {}

  @Get()
  findAll(
    @Query() pagination: PaginationQueryDto,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    return this.contributionsService.findAll(
      pagination.page ?? 1,
      pagination.limit ?? 20,
      status,
      search,
    );
  }

  @Get(':id')
  getById(@Param('id') id: string) {
    return this.contributionsService.getById(id);
  }

  @Patch(':id/approve')
  approve(@Param('id') id: string) {
    return this.contributionsService.approve(id);
  }

  @Patch(':id/reject')
  reject(@Param('id') id: string, @Body() dto: AdminRejectContributionDto) {
    return this.contributionsService.reject(id, dto.adminComment);
  }
}
