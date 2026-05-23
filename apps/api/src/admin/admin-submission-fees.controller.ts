import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '.prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  AdminSubmissionFeesService,
  SubmissionFeePaymentRowDto,
} from './admin-submission-fees.service';
import { ListScriptCreditPurchasesDto } from './dto/list-script-credit-purchases.dto';
import { FulfillScriptCreditsDto } from './dto/fulfill-script-credits.dto';

@ApiTags('admin-submission-fees')
@Controller('admin/submission-fee-payments')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.admin, UserRole.manager)
export class AdminSubmissionFeesController {
  constructor(private readonly submissionFees: AdminSubmissionFeesService) {}

  @Get()
  list(
    @Query() query: ListScriptCreditPurchasesDto,
  ): Promise<{ payments: SubmissionFeePaymentRowDto[]; total: number }> {
    return this.submissionFees.listPayments({
      search: query.search,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    });
  }

  @Post('fulfill')
  fulfill(@Body() dto: FulfillScriptCreditsDto) {
    return this.submissionFees.fulfillFromStripeSession(dto.sessionId);
  }
}
