import { IsString, MinLength } from 'class-validator';

export class FulfillScriptCreditsDto {
  @IsString()
  @MinLength(1)
  sessionId!: string;
}
