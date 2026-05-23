import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { FilmsModule } from '../films/films.module';
import { DonationsController } from './donations.controller';
import { DonationsService } from './donations.service';
import { PrismaModule } from '../prisma/prisma.module';

@Module({
  imports: [PrismaModule, AuthModule, FilmsModule],
  controllers: [DonationsController],
  providers: [DonationsService],
  exports: [DonationsService],
})
export class DonationsModule {}
