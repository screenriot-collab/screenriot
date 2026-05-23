import { Module } from '@nestjs/common';
import { PrismaModule } from '../prisma/prisma.module';
import { S3Module } from '../s3/s3.module';
import { AuthModule } from '../auth/auth.module';
import { FilmsController } from './films.controller';
import { FilmsService } from './films.service';
import { FilmDiscussionService } from './film-discussion.service';

@Module({
  imports: [PrismaModule, S3Module, AuthModule],
  controllers: [FilmsController],
  providers: [FilmsService, FilmDiscussionService],
  exports: [FilmsService, FilmDiscussionService],
})
export class FilmsModule {}
