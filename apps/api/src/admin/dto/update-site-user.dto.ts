import { IsOptional, IsString, IsEmail, IsIn, MaxLength, IsDateString } from 'class-validator';
import { UserRole } from '.prisma/client';

const SITE_ROLES: UserRole[] = ['fan' as UserRole, 'filmmaker' as UserRole];

export class UpdateSiteUserDto {
  @IsOptional()
  @IsString()
  @MaxLength(100)
  firstName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  lastName?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  displayName?: string;

  @IsOptional()
  @IsEmail()
  email?: string;

  @IsOptional()
  @IsString()
  @MaxLength(30)
  phone?: string;

  @IsOptional()
  @IsDateString()
  dateOfBirth?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  country?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  city?: string;

  @IsOptional()
  @IsString()
  @MaxLength(500)
  bio?: string;

  @IsOptional()
  @IsIn(SITE_ROLES)
  role?: UserRole;
}
