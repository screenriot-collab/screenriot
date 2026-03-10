import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  UseGuards,
  UseInterceptors,
  UploadedFile,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiConsumes } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { VerificationService } from './verification.service';
import { UploadDocumentDto } from './dto/upload-document.dto';

const DOC_MAX_SIZE = 10 * 1024 * 1024;
const DOC_MIMES = [
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
];

@ApiTags('verification')
@Controller('users/me/verification')
@UseGuards(JwtAuthGuard)
export class VerificationController {
  constructor(private readonly verificationService: VerificationService) {}

  @Get()
  getVerification(@CurrentUser('id') userId: string) {
    return this.verificationService.getVerification(userId);
  }

  @Post('documents')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('file', {
      limits: { fileSize: DOC_MAX_SIZE },
      fileFilter: (_req, file, cb) => {
        cb(null, DOC_MIMES.includes(file.mimetype));
      },
    }),
  )
  uploadDocument(
    @CurrentUser('id') userId: string,
    @Body() dto: UploadDocumentDto,
    @UploadedFile() file: Express.Multer.File,
  ) {
    return this.verificationService.uploadDocument(userId, dto.type, file);
  }

  @Delete('documents/:id')
  deleteDocument(
    @CurrentUser('id') userId: string,
    @Param('id') documentId: string,
  ) {
    return this.verificationService.deleteDocument(userId, documentId);
  }

  @Post('submit')
  submit(@CurrentUser('id') userId: string) {
    return this.verificationService.submit(userId);
  }
}
