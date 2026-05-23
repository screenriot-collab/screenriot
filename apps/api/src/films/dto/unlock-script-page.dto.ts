import { IsString, MinLength } from 'class-validator';

export class UnlockScriptPageDto {
  @IsString()
  @MinLength(1)
  pageId!: string;
}
