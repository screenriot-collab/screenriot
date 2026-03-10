import {
  Controller,
  Get,
  Post,
  Param,
  Patch,
  Body,
  UseGuards,
  Query,
  Res,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '.prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser, CurrentUserPayload } from '../auth/decorators/current-user.decorator';
import type { Response } from 'express';
import { ListFilmsQueryDto } from './dto/list-films.dto';
import { UpdateFilmReviewDto } from './dto/update-film-review.dto';
import { UpdateFilmPageDto } from './dto/update-film-page.dto';
import { AdminFilmsService } from './admin-films.service';

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50 MB

@ApiTags('admin-films')
@Controller('admin/films')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.admin, UserRole.manager)
export class AdminFilmsController {
  constructor(private readonly adminFilms: AdminFilmsService) {}

  @Get()
  list(@Query() query: ListFilmsQueryDto) {
    return this.adminFilms.list(query);
  }

  @Get(':id')
  getOne(@Param('id') id: string) {
    return this.adminFilms.getOne(id);
  }

  @Post(':id/files/:slot')
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(
    @Param('id') id: string,
    @Param('slot') slot: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ) {
    return this.adminFilms.uploadFile(id, slot, file);
  }

  @Get(':id/files/:slot')
  async downloadFile(
    @Param('id') id: string,
    @Param('slot') slot: string,
    @Res() res: Response,
  ) {
    const { body, contentType, filename } = await this.adminFilms.downloadFile(id, slot);
    res.setHeader('Content-Type', contentType ?? 'application/octet-stream');
    res.setHeader('Content-Disposition', `inline; filename="${filename}"`);
    res.send(body);
  }

  @Patch(':id/page')
  updateFilmPage(
    @Param('id') id: string,
    @Body() dto: UpdateFilmPageDto,
  ) {
    return this.adminFilms.updateFilmPage(id, dto);
  }

  @Patch(':id')
  updateReview(
    @Param('id') id: string,
    @Body() dto: UpdateFilmReviewDto,
    @CurrentUser() admin: CurrentUserPayload,
  ) {
    return this.adminFilms.updateReview(id, dto, admin.id);
  }
}
