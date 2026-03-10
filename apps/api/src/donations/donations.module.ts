import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule],
  controllers: [DonationsController],
  providers: [DonationsService],
})
export class DonationsModule {}
