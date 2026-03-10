import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '.prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FilmsService } from './films.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { CheckSlugQueryDto } from './dto/check-slug.dto';
import { ListPublicFilmsDto } from './dto/list-public-films.dto';
import { CreateCastingVoteDto } from './dto/create-casting-vote.dto';
import { CreatePledgeVoteDto } from './dto/create-pledge-vote.dto';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB for video/PDF

@ApiTags('films')
@Controller('films')
export class FilmsController {
  constructor(private readonly films: FilmsService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() user: { id: string; role: string }) {
    return this.films.findAllByUser(user.id, user.role as UserRole);
  }

  @Get('public')
  listPublic(@Query() query: ListPublicFilmsDto) {
    return this.films.listPublic({
      page: query.page,
      limit: query.limit,
      genre: query.genre,
      search: query.search,
    });
  }

  @Get('check-slug')
  @UseGuards(JwtAuthGuard)
  checkSlug(@Query() query: CheckSlugQueryDto) {
    return this.films.checkSlug(query.slug, query.excludeFilmId);
  }

  @Get('slug/:slug')
  findBySlug(@Param('slug') slug: string) {
    return this.films.findBySlug(slug);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.films.findOneById(id, user.id, user.role as UserRole);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.filmmaker)
  create(@Body() dto: CreateFilmDto, @CurrentUser() user: { id: string }) {
    return this.films.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.filmmaker)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFilmDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.films.update(id, dto, user.id, UserRole.filmmaker);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.filmmaker)
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.films.remove(id, user.id);
  }

  @Post(':id/pay')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.filmmaker)
  pay(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.films.paySubmissionFee(id, user.id);
  }

  @Post(':id/casting-vote')
  @UseGuards(JwtAuthGuard)
  castingVote(
    @Param('id') id: string,
    @Body() dto: CreateCastingVoteDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.films.createCastingVote(id, user.id, dto.optionId);
  }

  @Get(':id/casting-vote/my')
  @UseGuards(JwtAuthGuard)
  getMyCastingVotes(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.films.getMyCastingVotes(id, user.id);
  }

  @Post(':id/pledge-vote')
  @UseGuards(JwtAuthGuard)
  createPledgeVote(
    @Param('id') id: string,
    @Body() dto: CreatePledgeVoteDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.films.createPledgeVote(id, user.id, dto.scores);
  }

  @Get(':id/pledge-vote/my')
  @UseGuards(JwtAuthGuard)
  getMyPledgeVote(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.films.getMyPledgeVote(id, user.id);
  }

  @Post(':id/files/:slot')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.filmmaker)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Param('id') id: string,
    @Param('slot') slot: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: { id: string },
  ) {
    return this.films.uploadFile(id, slot, file, user.id);
  }
}
