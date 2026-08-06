import { Controller, Get, Param, ParseIntPipe, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '.prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  TmdbService,
  TmdbActorResult,
  TmdbPersonDetails,
  TmdbMovieResult,
  TmdbMovieDetails,
} from '../tmdb/tmdb.service';
import { SearchTmdbActorDto } from './dto/search-tmdb-actor.dto';
import { SearchTmdbMovieDto } from './dto/search-tmdb-movie.dto';

@ApiTags('admin-tmdb')
@Controller('admin/tmdb')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.admin, UserRole.manager)
export class AdminTmdbController {
  constructor(private readonly tmdb: TmdbService) {}

  @Get('search-actor')
  async searchActor(@Query() dto: SearchTmdbActorDto): Promise<{ results: TmdbActorResult[] }> {
    const results = await this.tmdb.searchActor(dto.query);
    return { results };
  }

  @Get('person/:id')
  getPersonDetails(@Param('id', ParseIntPipe) id: number): Promise<TmdbPersonDetails> {
    return this.tmdb.getPersonDetails(id);
  }

  @Get('search-movie')
  async searchMovie(@Query() dto: SearchTmdbMovieDto): Promise<{ results: TmdbMovieResult[] }> {
    const results = await this.tmdb.searchMovie(dto.query);
    return { results };
  }

  @Get('movie/:id')
  getMovieDetails(@Param('id', ParseIntPipe) id: number): Promise<TmdbMovieDetails> {
    return this.tmdb.getMovieDetails(id);
  }
}
