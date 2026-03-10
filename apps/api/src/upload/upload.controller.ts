import {
  Controller,
  Post,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  BadRequestException,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { S3Service } from '../s3/s3.service';
import { randomUUID } from 'crypto';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'application/pdf',
];

function assertMime(allowed: string[], mimetype: string) {
  if (!allowed.includes(mimetype)) {
    throw new BadRequestException(
      `File type not allowed. Allowed: ${allowed.join(', ')}`,
    );
  }
}

@ApiTags('upload')
@Controller('upload')
@UseGuards(JwtAuthGuard)
export class UploadController {
  constructor(private readonly s3: S3Service) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async upload(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    assertMime(ALLOWED_MIME, file.mimetype);
    const ext = file.originalname.split('.').pop() ?? 'bin';
    const key = `uploads/${randomUUID()}.${ext}`;
    return this.s3.upload(key, file.buffer, file.mimetype);
  }

  @Post('poster')
  @UseInterceptors(FileInterceptor('file'))
  async uploadPoster(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    assertMime(
      ['image/jpeg', 'image/png', 'image/webp'],
      file.mimetype,
    );
    const ext = file.originalname.split('.').pop() ?? 'jpg';
    const key = `posters/${randomUUID()}.${ext}`;
    return this.s3.upload(key, file.buffer, file.mimetype);
  }

  @Post('document')
  @UseInterceptors(FileInterceptor('file'))
  async uploadDocument(
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    assertMime(
      ['image/jpeg', 'image/png', 'image/webp', 'application/pdf'],
      file.mimetype,
    );
    const ext = file.originalname.split('.').pop() ?? 'bin';
    const key = `documents/${randomUUID()}.${ext}`;
    return this.s3.upload(key, file.buffer, file.mimetype);
  }
}
