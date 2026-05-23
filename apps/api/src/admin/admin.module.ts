import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminAuthController } from './admin-auth.controller';
import { AdminUsersController } from './admin-users.controller';
import { AdminFilmsController } from './admin-films.controller';
import { AdminVerificationController } from './admin-verification.controller';
import { AdminSiteUsersController } from './admin-site-users.controller';
import { AdminStatsController } from './admin-stats.controller';
import { AdminInvestmentsController } from './admin-investments.controller';
import { AdminContributionsController } from './admin-contributions.controller';
import { AdminScriptCreditsController } from './admin-script-credits.controller';
import { AdminSubmissionFeesController } from './admin-submission-fees.controller';
import { AdminCastingSuggestionsController } from './admin-casting-suggestions.controller';
import { AdminFilmsService } from './admin-films.service';
import { AdminUsersService } from './admin-users.service';
import { AdminVerificationService } from './admin-verification.service';
import { AdminSiteUsersService } from './admin-site-users.service';
import { AdminStatsService } from './admin-stats.service';
import { AdminInvestmentsService } from './admin-investments.service';
import { AdminContributionsService } from './admin-contributions.service';
import { AdminScriptCreditsService } from './admin-script-credits.service';
import { AdminSubmissionFeesService } from './admin-submission-fees.service';
import { AdminCastingSuggestionsService } from './admin-casting-suggestions.service';
import { AuthModule } from '../auth/auth.module';
import { PrismaModule } from '../prisma/prisma.module';
import { MailModule } from '../mail/mail.module';
import { FilmsModule } from '../films/films.module';
import { DonationsModule } from '../donations/donations.module';

@Module({
  imports: [AuthModule, PrismaModule, MailModule, FilmsModule, DonationsModule],
  controllers: [
    AdminController,
    AdminAuthController,
    AdminUsersController,
    AdminFilmsController,
    AdminVerificationController,
    AdminSiteUsersController,
    AdminStatsController,
    AdminInvestmentsController,
    AdminContributionsController,
    AdminScriptCreditsController,
    AdminSubmissionFeesController,
    AdminCastingSuggestionsController,
  ],
  providers: [
    AdminFilmsService,
    AdminUsersService,
    AdminVerificationService,
    AdminSiteUsersService,
    AdminStatsService,
    AdminInvestmentsService,
    AdminContributionsService,
    AdminScriptCreditsService,
    AdminSubmissionFeesService,
    AdminCastingSuggestionsService,
  ],
})
export class AdminModule {}
