import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateCastingSuggestionDto {
  @IsString()
  @MinLength(1)
  @MaxLength(120)
  actorName!: string;

  @IsOptional()
  @IsString()
  @MaxLength(120)
  roleHint?: string;
}
