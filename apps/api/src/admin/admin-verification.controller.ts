import {
  Controller,
  Get,
  Patch,
  Param,
  Body,
  Query,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UserRole, VerificationStatus } from '.prisma/client';
import { AdminVerificationService } from './admin-verification.service';
import {
  ReviewVerificationDto,
  ReviewDocumentDto,
} from './dto/review-verification.dto';

@ApiTags('admin-verification')
@Controller('admin/verifications')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.admin, UserRole.manager)
export class AdminVerificationController {
  constructor(
    private readonly adminVerificationService: AdminVerificationService,
  ) {}

  @Get()
  list(
    @Query('status') status?: VerificationStatus,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    return this.adminVerificationService.list(
      status,
      page ? Number(page) : 1,
      limit ? Number(limit) : 20,
    );
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.adminVerificationService.getDetail(id);
  }

  @Patch(':id')
  review(
    @Param('id') id: string,
    @CurrentUser('id') adminId: string,
    @Body() dto: ReviewVerificationDto,
  ) {
    return this.adminVerificationService.review(
      id,
      adminId,
      dto.action,
      dto.adminFeedback,
    );
  }

  @Patch(':id/documents/:docId')
  reviewDocument(
    @Param('id') id: string,
    @Param('docId') docId: string,
    @Body() dto: ReviewDocumentDto,
  ) {
    return this.adminVerificationService.reviewDocument(
      id,
      docId,
      dto.action,
      dto.adminComment,
    );
  }
}
