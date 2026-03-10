import { IsOptional, IsString, IsNumber, Min, MaxLength } from 'class-validator';

export class CreateFilmDto {
  @IsString()
  @MaxLength(500)
  title: string;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  logline?: string;

  @IsOptional()
  @IsString()
  synopsis?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  genre?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  runtime?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  rating?: string;

  @IsOptional()
  @IsString()
  @MaxLength(200)
  directorName?: string;

  @IsOptional()
  @IsNumber()
  @Min(0)
  goalAmount?: number;
}
