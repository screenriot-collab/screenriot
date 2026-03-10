import { IsBoolean, IsEmail, IsIn, IsOptional, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email: string;

  @IsString()
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  password: string;

  /** Account type: fan (Film-Fan) or filmmaker (Filmmaker + Fan). Default fan. */
  @IsOptional()
  @IsIn(['fan', 'filmmaker'], { message: 'Role must be fan or filmmaker' })
  role?: 'fan' | 'filmmaker';

  /** Platform terms accepted; sets agreementSignedAt when true. */
  @IsOptional()
  @IsBoolean()
  acceptTerms?: boolean;
}
