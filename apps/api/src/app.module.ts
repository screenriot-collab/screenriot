import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { PrismaModule } from './prisma/prisma.module';
import { MailModule } from './mail/mail.module';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { FilmsModule } from './films/films.module';
import { DonationsModule } from './donations/donations.module';
import { AdminModule } from './admin/admin.module';
import { S3Module } from './s3/s3.module';
import { TmdbModule } from './tmdb/tmdb.module';
import { UploadModule } from './upload/upload.module';
import { HealthModule } from './health/health.module';
import { VerificationModule } from './verification/verification.module';
import { ContributionsModule } from './contributions/contributions.module';

@Module({
  imports: [
    PrismaModule,
    MailModule,
    S3Module,
    TmdbModule,
    HealthModule,
    AuthModule,
    UsersModule,
    FilmsModule,
    DonationsModule,
    AdminModule,
    UploadModule,
    VerificationModule,
    ContributionsModule,
  ],
  controllers: [AppController],
  // HealthController handles GET /health (replaces AppController.getHealth)
})
export class AppModule {}
