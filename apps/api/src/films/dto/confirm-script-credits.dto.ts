import { IsString, MinLength } from 'class-validator';

export class ConfirmScriptCreditsDto {
  @IsString()
  @MinLength(1)
  sessionId!: string;
}
