import { Body, Controller, Get, Post, Query, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '.prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import {
  AdminScriptCreditsService,
  ScriptCreditPurchaseRowDto,
} from './admin-script-credits.service';
import { ListScriptCreditPurchasesDto } from './dto/list-script-credit-purchases.dto';
import { FulfillScriptCreditsDto } from './dto/fulfill-script-credits.dto';

@ApiTags('admin-script-credits')
@Controller('admin/script-credit-purchases')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.admin, UserRole.manager)
export class AdminScriptCreditsController {
  constructor(private readonly scriptCredits: AdminScriptCreditsService) {}

  @Get()
  list(
    @Query() query: ListScriptCreditPurchasesDto,
  ): Promise<{ purchases: ScriptCreditPurchaseRowDto[]; total: number }> {
    return this.scriptCredits.listPurchases({
      search: query.search,
      page: query.page ? parseInt(query.page, 10) : undefined,
      limit: query.limit ? parseInt(query.limit, 10) : undefined,
    });
  }

  @Post('fulfill')
  fulfill(@Body() dto: FulfillScriptCreditsDto) {
    return this.scriptCredits.fulfillFromStripeSession(dto.sessionId);
  }
}
