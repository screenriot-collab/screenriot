import { Type } from 'class-transformer';
import {
  IsOptional,
  IsString,
  IsUrl,
  IsDateString,
  MaxLength,
  ValidateNested,
  IsInt,
  Min,
  Max,
  IsArray,
} from 'class-validator';

export class UpdateFilmmakerDto {
  @IsOptional()
  @IsString()
  @MaxLength(200)
  productionCompany?: string;

  @IsOptional()
  @IsUrl()
  imdbUrl?: string;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  statement?: string;

  @IsOptional()
  @IsInt()
  @Min(0)
  @Max(70)
  yearsOfExperience?: number;

  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  specialization?: string[];
}

export class UpdateProfileDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsUrl()
  website?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  socialTwitter?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  socialInstagram?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  socialLinkedin?: string;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateFilmmakerDto)
  filmmaker?: UpdateFilmmakerDto;
}
