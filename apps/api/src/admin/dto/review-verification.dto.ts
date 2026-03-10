import { IsEnum, IsOptional, IsString, MaxLength } from 'class-validator';

export enum ReviewAction {
  approve = 'approve',
  reject = 'reject',
}

export class ReviewVerificationDto {
  @IsEnum(ReviewAction)
  action: ReviewAction;

  @IsOptional()
  @IsString()
  @MaxLength(2000)
  adminFeedback?: string;
}

export class ReviewDocumentDto {
  @IsEnum(ReviewAction)
  action: ReviewAction;

  @IsOptional()
  @IsString()
  @MaxLength(1000)
  adminComment?: string;
}
