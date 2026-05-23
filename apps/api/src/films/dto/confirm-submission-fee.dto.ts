import { IsString } from 'class-validator';

export class ConfirmSubmissionFeeDto {
  @IsString()
  sessionId: string;
}
