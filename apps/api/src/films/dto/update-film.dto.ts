import { PartialType } from '@nestjs/mapped-types';
import { CreateFilmDto } from './create-film.dto';
import { IsOptional, IsObject, IsBoolean, IsString, IsNumber } from 'class-validator';

export class UpdateFilmDto extends PartialType(CreateFilmDto) {
  @IsOptional()
  @IsString()
  description?: string;

  @IsOptional()
  @IsNumber()
  goalAmount?: number;

  @IsOptional()
  @IsObject()
  step3?: Record<string, unknown>;

  @IsOptional()
  @IsObject()
  step4?: Record<string, unknown>;

  @IsOptional()
  @IsBoolean()
  submissionFeePaid?: boolean;
}
