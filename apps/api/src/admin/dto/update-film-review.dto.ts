import { IsEnum, IsObject, IsOptional } from 'class-validator';
import { FilmStatus, ReviewStatus } from '.prisma/client';

export class UpdateFilmReviewDto {
  @IsOptional()
  @IsEnum(FilmStatus)
  status?: FilmStatus;

  @IsOptional()
  @IsEnum(ReviewStatus)
  reviewStatus?: ReviewStatus;

  /**
   * Per-step moderator comments (Option 2): { step1?: string, ... step5?: string }
   */
  @IsOptional()
  @IsObject()
  reviewComments?: Record<string, unknown>;
}

