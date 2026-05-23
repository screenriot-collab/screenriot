import { IsString, MinLength } from 'class-validator';

export class ConfirmDonationDto {
  @IsString()
  @MinLength(1)
  sessionId!: string;
}
