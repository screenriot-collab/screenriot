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

@ApiTags('admin')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.admin, UserRole.manager)
@Controller('admin/contributions')
export class AdminContributionsController {
  constructor(private readonly contributionsService: AdminContributionsService) {}

  @Get()
  findAll(
    @Query('page') page?: string,
    @Query('limit') limit?: string,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ) {
    const p = Math.max(1, parseInt(page || '1', 10));
    const l = Math.min(100, Math.max(1, parseInt(limit || '20', 10)));
    return this.contributionsService.findAll(p, l, status, search);
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
