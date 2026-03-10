import { IsOptional, IsString } from 'class-validator';
import { Transform } from 'class-transformer';

export class CheckSlugQueryDto {
  @IsString()
  @Transform(({ value }) => (typeof value === 'string' ? value.trim() : value))
  slug: string;

  @IsOptional()
  @IsString()
  excludeFilmId?: string;
}
