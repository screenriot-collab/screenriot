import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../s3/s3.module';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';

@Module({
  imports: [PrismaModule, S3Module],
  controllers: [FilmsController],
  providers: [FilmsService],
})
export class FilmsModule {}
