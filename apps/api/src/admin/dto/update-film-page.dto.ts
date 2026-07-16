import {
  IsOptional,
  IsString,
  IsNumber,
  IsObject,
  IsInt,
  IsBoolean,
  Min,
  Max,
  IsDateString,
} from 'class-validator';
import { Type } from 'class-transformer';

export class UpdateFilmPageDto {
  /** Slug is set from the application and is not editable via this endpoint. */
  @IsOptional()
  @IsString()
  title?: string;

  @IsOptional()
  @IsString()
  logline?: string;

  @IsOptional()
  @IsString()
  synopsis?: string;

  @IsOptional()
  @IsString()
  directorName?: string;

  @IsOptional()
  @IsString()
  genre?: string;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  goalAmount?: number;

  @IsOptional()
  @IsDateString()
  deadline?: string;

  @IsOptional()
  @IsString()
  posterUrl?: string;

  @IsOptional()
  @IsObject()
  pageContent?: Record<string, unknown>;

  @IsOptional()
  @IsString()
  trendingText?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(0)
  cachedVotesCount?: number;

  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(0)
  @Max(10)
  cachedAverageScore?: number;

  @IsOptional()
  @Type(() => Boolean)
  @IsBoolean()
  pagePublished?: boolean;
}
