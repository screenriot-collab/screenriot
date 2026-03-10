import { IsBoolean, IsEnum, IsInt, IsOptional, IsString, Max, Min } from 'class-validator';
import { FilmStatus } from '.prisma/client';
import { Transform, Type } from 'class-transformer';

export class ListFilmsQueryDto {
  @IsOptional()
  @IsEnum(FilmStatus)
  status?: FilmStatus;

  /** When true, return only films with status in [approved, fundraising, funded, closed] (published film pages). */
  @IsOptional()
  @Transform(({ value }) => value === 'true' || value === true)
  @IsBoolean()
  published?: boolean;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  search?: string;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page?: number;

  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(100)
  limit?: number;
}

