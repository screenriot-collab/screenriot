import { IsString, MinLength } from 'class-validator';

export class FulfillDonationDto {
  @IsString()
  @MinLength(1)
  sessionId!: string;
}
