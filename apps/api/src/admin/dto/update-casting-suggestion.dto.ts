import { IsEnum, IsOptional, IsString, MaxLength, MinLength } from 'class-validator';
import { CastingSuggestionStatus } from '.prisma/client';

export class UpdateCastingSuggestionDto {
  @IsEnum(CastingSuggestionStatus)
  status!: CastingSuggestionStatus;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  adminNote?: string;

  @IsOptional()
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  actorName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  roleHint?: string;
}
