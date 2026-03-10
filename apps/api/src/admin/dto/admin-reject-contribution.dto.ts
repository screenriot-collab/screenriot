import { IsString, IsNotEmpty } from 'class-validator';

export class AdminRejectContributionDto {
  @IsString()
  @IsNotEmpty()
  adminComment: string;
}
