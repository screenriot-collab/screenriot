import { Injectable, ForbiddenException } from '@nestjs/common';
import { UserRole } from '.prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from '../auth/auth.service';
import { InviteUserDto, isInviteableRole } from './dto/invite-user.dto';

@Injectable()
export class AdminUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly authService: AuthService,
  ) {}

  async list() {
    const users = await this.prisma.user.findMany({
      where: {
        role: { in: [UserRole.super_admin, UserRole.admin, UserRole.manager] },
      },
      select: { id: true, username: true, email: true, role: true, createdAt: true },
      orderBy: { createdAt: 'desc' },
    });
    return { users };
  }

  async invite(dto: InviteUserDto) {
    const role = dto.role as UserRole;
    if (!isInviteableRole(role)) {
      throw new ForbiddenException('Invalid role');
    }

    const existingUsername = await this.prisma.user.findUnique({
      where: { username: dto.username.trim() },
    });
    if (existingUsername) throw new ForbiddenException('Username already taken');

    const existingEmail = await this.prisma.user.findUnique({
      where: { email: dto.email.toLowerCase() },
    });
    if (existingEmail) throw new ForbiddenException('Email already registered');

    const bcrypt = await import('bcrypt');
    const placeholderHash = await bcrypt.hash('CHANGE_ME_RESET_PASSWORD', 10);

    const user = await this.prisma.user.create({
      data: {
        username: dto.username.trim(),
        email: dto.email.toLowerCase(),
        passwordHash: placeholderHash,
        role,
      },
    });

    await this.authService.sendAdminInviteEmail(
      user.id,
      user.email,
      user.username ?? '',
      user.role,
    );

    return {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
      message: 'Invite email sent.',
    };
  }

  async delete(targetId: string, currentUser: { id: string; role: string }) {
    const target = await this.prisma.user.findUnique({ where: { id: targetId } });
    if (!target) throw new ForbiddenException('User not found');

    const currentRole = currentUser.role as UserRole;

    if (target.role === UserRole.super_admin) {
      throw new ForbiddenException('Super admin cannot be deleted');
    }
    if (target.role === UserRole.admin && currentRole !== UserRole.super_admin) {
      throw new ForbiddenException('Only super admin can delete an admin');
    }
    if (
      target.role === UserRole.manager &&
      currentRole !== UserRole.super_admin &&
      currentRole !== UserRole.admin
    ) {
      throw new ForbiddenException('Only super admin or admin can delete a manager');
    }
    if (target.role === UserRole.fan || target.role === UserRole.filmmaker) {
      throw new ForbiddenException('Cannot delete site user from admin panel');
    }

    await this.prisma.user.delete({ where: { id: targetId } });
    return { ok: true };
  }
}
