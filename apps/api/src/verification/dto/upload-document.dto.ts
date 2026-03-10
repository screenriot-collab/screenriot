import { IsEnum } from 'class-validator';
import { VerificationDocType } from '.prisma/client';

export class UploadDocumentDto {
  @IsEnum(VerificationDocType)
  type: VerificationDocType;
}
