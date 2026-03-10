import { IsEmail } from 'class-validator';

export class RequestChangeEmailDto {
  @IsEmail()
  newEmail: string;
}
