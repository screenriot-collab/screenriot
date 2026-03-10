import { IsString, MinLength } from 'class-validator';

export class CreateCastingVoteDto {
  @IsString()
  @MinLength(1)
  optionId!: string;
}

