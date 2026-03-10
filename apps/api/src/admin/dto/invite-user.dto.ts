import { IsEmail, IsEnum, IsString, MinLength } from 'class-validator';
import { UserRole } from '.prisma/client';

const INVITEABLE_ROLES: UserRole[] = ['admin', 'manager'];

export class InviteUserDto {
  @IsString()
  @MinLength(1, { message: 'Username is required' })
  username: string;

  @IsEmail()
  email: string;

  @IsEnum(['admin', 'manager'], {
    message: 'Role must be admin or manager',
  })
  role: 'admin' | 'manager';
}

export function isInviteableRole(role: UserRole): boolean {
  return INVITEABLE_ROLES.includes(role);
}
