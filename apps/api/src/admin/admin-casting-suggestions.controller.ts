import { Body, Controller, Get, Param, Patch, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '.prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  AdminCastingSuggestionsService,
  CastingSuggestionFilmSummaryDto,
  CastingSuggestionRowDto,
} from './admin-casting-suggestions.service';
import { UpdateCastingSuggestionDto } from './dto/update-casting-suggestion.dto';
import { PaginationQueryDto } from '../common/dto/pagination-query.dto';

@ApiTags('admin-casting-suggestions')
@Controller('admin/casting-suggestions')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.admin, UserRole.manager)
export class AdminCastingSuggestionsController {
  constructor(private readonly suggestions: AdminCastingSuggestionsService) {}

  @Get('films')
  listFilms(
    @Query() pagination: PaginationQueryDto,
    @Query('status') status?: string,
    @Query('search') search?: string,
  ): Promise<{ films: CastingSuggestionFilmSummaryDto[]; total: number }> {
    return this.suggestions.listFilms({
      status,
      search,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Get()
  list(
    @Query() pagination: PaginationQueryDto,
    @Query('filmId') filmId: string,
    @Query('status') status?: string,
  ): Promise<{ suggestions: CastingSuggestionRowDto[]; total: number }> {
    return this.suggestions.list({
      status,
      filmId,
      page: pagination.page,
      limit: pagination.limit,
    });
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() dto: UpdateCastingSuggestionDto) {
    return this.suggestions.update(id, dto);
  }
}
