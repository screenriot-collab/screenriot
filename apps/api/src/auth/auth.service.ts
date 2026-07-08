import {
  Injectable,
  UnauthorizedException,
  ConflictException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { OAuth2Client } from 'google-auth-library';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { UserRole, VerificationStatus } from '.prisma/client';

const SALT_ROUNDS = 10;
const EMAIL_VERIFY_EXPIRY = '48h';
const EMAIL_VERIFY_PURPOSE = 'email_verify';
const PASSWORD_RESET_EXPIRY = '1h';
const PASSWORD_RESET_PURPOSE = 'password_reset';
const EMAIL_CHANGE_EXPIRY = '48h';
const EMAIL_CHANGE_PURPOSE = 'email_change';
const ADMIN_INVITE_EXPIRY = '7d';
const ADMIN_INVITE_PURPOSE = 'admin_invite';
const ADMIN_PASSWORD_RESET_EXPIRY = '1h';
const ADMIN_PASSWORD_RESET_PURPOSE = 'admin_password_reset';

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
  username?: string;
}

export interface AuthResult {
  access_token: string;
  user: { id: string; email: string; role: UserRole; username?: string };
}

@Injectable()
export class AuthService {
  private readonly googleClient: OAuth2Client | null = null;

  private get frontendUrl(): string {
    return (process.env.FRONTEND_URL ?? 'http://localhost:3000').replace(/\/$/, '');
  }

  private get adminUrl(): string {
    return (process.env.ADMIN_URL ?? 'http://localhost:5173').replace(/\/$/, '');
  }

  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly mailService: MailService,
  ) {
    const googleClientId = process.env.GOOGLE_CLIENT_ID;
    if (googleClientId) {
      this.googleClient = new OAuth2Client(googleClientId);
    }
  }

  async register(
    email: string,
    password: string,
    role?: 'fan' | 'filmmaker',
    acceptTerms?: boolean,
  ): Promise<AuthResult> {
    const safeRole =
      role === 'filmmaker' ? UserRole.filmmaker : UserRole.fan;

    const existing = await this.prisma.user.findUnique({ where: { email } });
    if (existing) {
      throw new ConflictException('User with this email already exists');
    }
    const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
    const user = await this.prisma.user.create({
      data: {
        email: email.toLowerCase(),
        passwordHash,
        role: safeRole,
        agreementSignedAt: acceptTerms === true ? new Date() : undefined,
      },
    });
    await this.sendVerificationEmail(user.id, user.email);
    return this.createAuthResult(user);
  }

  async sendVerificationEmail(userId: string, email: string): Promise<void> {
    const token = this.jwtService.sign(
      { sub: userId, purpose: EMAIL_VERIFY_PURPOSE },
      { expiresIn: EMAIL_VERIFY_EXPIRY },
    );
    const baseUrl = this.frontendUrl;
    const link = `${baseUrl}/verify-email?token=${encodeURIComponent(token)}`;
    await this.mailService.sendMail({
      to: email,
      subject: 'Confirm your email — Screen Riot',
      html: `
        <p>You have registered on Screen Riot.</p>
        <p>Please confirm your email by clicking the link below:</p>
        <p><a href="${link}">${link}</a></p>
        <p>This link expires in 48 hours.</p>
      `,
      text: `You have registered on Screen Riot. Confirm your email: ${link} (expires in 48 hours).`,
    });
  }

  async verifyEmail(token: string): Promise<{ ok: boolean }> {
    try {
      const payload = this.jwtService.verify<{ sub: string; purpose: string }>(token);
      if (payload.purpose !== EMAIL_VERIFY_PURPOSE || !payload.sub) {
        throw new BadRequestException('Invalid or expired verification link');
      }
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { emailVerifiedAt: new Date() },
      });
      return { ok: true };
    } catch {
      throw new BadRequestException('Invalid or expired verification link');
    }
  }

  async resendVerificationEmail(userId: string): Promise<{ ok: boolean }> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, emailVerifiedAt: true },
    });
    if (!user) throw new UnauthorizedException('User not found');
    if (user.emailVerifiedAt) {
      throw new BadRequestException('Email is already verified');
    }
    await this.sendVerificationEmail(user.id, user.email);
    return { ok: true };
  }

  async sendAdminInviteEmail(
    userId: string,
    email: string,
    username: string,
    role: UserRole,
  ): Promise<void> {
    const token = this.jwtService.sign(
      { sub: userId, purpose: ADMIN_INVITE_PURPOSE },
      { expiresIn: ADMIN_INVITE_EXPIRY },
    );
    const baseUrl = this.adminUrl;
    const link = `${baseUrl}/accept-invite?token=${encodeURIComponent(token)}`;
    await this.mailService.sendMail({
      to: email,
      subject: 'You have been invited to Screen Riot admin',
      html: `
        <p>Hello ${username},</p>
        <p>You have been invited to join the Screen Riot admin panel as <strong>${role}</strong>.</p>
        <p>To activate your account, please set your password using the link below:</p>
        <p><a href="${link}">Accept invite and set password</a></p>
        <p>This link expires in 7 days. If you did not expect this invite, you can ignore this email.</p>
      `,
      text: `You have been invited to Screen Riot admin as ${role}. Set your password: ${link} (expires in 7 days). If you did not expect this invite, ignore this email.`,
    });
  }

  /** Do not reveal whether email exists; always return same message. */
  async forgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, passwordHash: true },
    });
    if (user?.passwordHash) {
      const token = this.jwtService.sign(
        { sub: user.id, purpose: PASSWORD_RESET_PURPOSE },
        { expiresIn: PASSWORD_RESET_EXPIRY },
      );
      const baseUrl = this.frontendUrl;
      const link = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
      await this.mailService.sendMail({
        to: user.email,
        subject: 'Reset your password — Screen Riot',
        html: `
          <p>You requested a password reset.</p>
          <p><a href="${link}">Reset password</a></p>
          <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
        `,
        text: `Reset your password: ${link} (expires in 1 hour). If you did not request this, ignore this email.`,
      });
    }
    return { message: 'If an account exists with this email, you will receive a password reset link.' };
  }

  async resetPassword(token: string, newPassword: string): Promise<{ ok: boolean }> {
    try {
      const payload = this.jwtService.verify<{ sub: string; purpose: string }>(token);
      if (payload.purpose !== PASSWORD_RESET_PURPOSE || !payload.sub) {
        throw new BadRequestException('Invalid or expired reset link');
      }
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { passwordHash },
      });
      return { ok: true };
    } catch {
      throw new BadRequestException('Invalid or expired reset link');
    }
  }

  async requestChangeEmail(userId: string, newEmail: string): Promise<{ message: string }> {
    const normalized = newEmail.toLowerCase();
    const existing = await this.prisma.user.findUnique({ where: { email: normalized } });
    if (existing) {
      throw new ConflictException('This email is already in use');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, verification: { select: { status: true } } },
    });
    if (!user) throw new UnauthorizedException('User not found');
    const verStatus = user.verification?.status;
    if (verStatus === VerificationStatus.verified || verStatus === VerificationStatus.pending) {
      throw new ForbiddenException(
        'Cannot change email after identity verification. Contact support if you need to update it.',
      );
    }
    const token = this.jwtService.sign(
      { sub: user.id, newEmail: normalized, purpose: EMAIL_CHANGE_PURPOSE },
      { expiresIn: EMAIL_CHANGE_EXPIRY },
    );
    const baseUrl = this.frontendUrl;
    const link = `${baseUrl}/confirm-email-change?token=${encodeURIComponent(token)}`;
    await this.mailService.sendMail({
      to: normalized,
      subject: 'Confirm your new email — Screen Riot',
      html: `
        <p>You requested to change your email to this address.</p>
        <p><a href="${link}">Confirm email change</a></p>
        <p>This link expires in 48 hours. If you did not request this, ignore this email.</p>
      `,
      text: `Confirm your new email: ${link} (expires in 48 hours). If you did not request this, ignore this email.`,
    });
    return { message: 'A confirmation link has been sent to the new email address.' };
  }

  async confirmEmailChange(token: string): Promise<{ ok: boolean }> {
    try {
      const payload = this.jwtService.verify<{ sub: string; newEmail: string; purpose: string }>(token);
      if (payload.purpose !== EMAIL_CHANGE_PURPOSE || !payload.sub || !payload.newEmail) {
        throw new BadRequestException('Invalid or expired link');
      }
      const existing = await this.prisma.user.findUnique({ where: { email: payload.newEmail } });
      if (existing) {
        throw new BadRequestException('This email is already in use');
      }
      await this.prisma.user.update({
        where: { id: payload.sub },
        data: { email: payload.newEmail, emailVerifiedAt: new Date() },
      });
      return { ok: true };
    } catch {
      throw new BadRequestException('Invalid or expired link');
    }
  }

  private static readonly ADMIN_ROLES: UserRole[] = [
    UserRole.super_admin,
    UserRole.admin,
    UserRole.manager,
  ];

  async acceptAdminInvite(token: string, password: string): Promise<{ ok: boolean }> {
    try {
      const payload = this.jwtService.verify<{ sub: string; purpose: string }>(token);
      if (payload.purpose !== ADMIN_INVITE_PURPOSE || !payload.sub) {
        throw new BadRequestException('Invalid or expired invite link');
      }
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
      });
      if (!user) {
        throw new BadRequestException('Invalid or expired invite link');
      }
      if (!AuthService.ADMIN_ROLES.includes(user.role)) {
        throw new BadRequestException('Invalid invite role');
      }
      const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });
      return { ok: true };
    } catch {
      throw new BadRequestException('Invalid or expired invite link');
    }
  }

  /** Admin panel: send password reset email. Only for admin roles; do not reveal if email exists. */
  async adminForgotPassword(email: string): Promise<{ message: string }> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      select: { id: true, email: true, passwordHash: true, role: true },
    });
    if (user?.passwordHash && AuthService.ADMIN_ROLES.includes(user.role)) {
      const token = this.jwtService.sign(
        { sub: user.id, purpose: ADMIN_PASSWORD_RESET_PURPOSE },
        { expiresIn: ADMIN_PASSWORD_RESET_EXPIRY },
      );
      const baseUrl = this.adminUrl;
      const link = `${baseUrl}/reset-password?token=${encodeURIComponent(token)}`;
      await this.mailService.sendMail({
        to: user.email,
        subject: 'Reset your admin password — Screen Riot',
        html: `
          <p>You requested a password reset for the Screen Riot admin panel.</p>
          <p><a href="${link}">Reset password</a></p>
          <p>This link expires in 1 hour. If you did not request this, ignore this email.</p>
        `,
        text: `Reset your admin password: ${link} (expires in 1 hour). If you did not request this, ignore this email.`,
      });
    }
    return { message: 'If an admin account exists with this email, you will receive a reset link.' };
  }

  async adminResetPassword(token: string, newPassword: string): Promise<{ ok: boolean }> {
    try {
      const payload = this.jwtService.verify<{ sub: string; purpose: string }>(token);
      if (payload.purpose !== ADMIN_PASSWORD_RESET_PURPOSE || !payload.sub) {
        throw new BadRequestException('Invalid or expired reset link');
      }
      const user = await this.prisma.user.findUnique({
        where: { id: payload.sub },
        select: { id: true, role: true },
      });
      if (!user || !AuthService.ADMIN_ROLES.includes(user.role)) {
        throw new BadRequestException('Invalid or expired reset link');
      }
      const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
      await this.prisma.user.update({
        where: { id: user.id },
        data: { passwordHash },
      });
      return { ok: true };
    } catch {
      throw new BadRequestException('Invalid or expired reset link');
    }
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid email or password');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid email or password');
    }
    return this.createAuthResult(user);
  }

  async adminLogin(username: string, password: string): Promise<AuthResult> {
    const user = await this.prisma.user.findUnique({
      where: { username: username.trim() },
    });
    if (!user?.passwordHash) {
      throw new UnauthorizedException('Invalid username or password');
    }
    if (!AuthService.ADMIN_ROLES.includes(user.role)) {
      throw new UnauthorizedException('Invalid username or password');
    }
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedException('Invalid username or password');
    }
    return this.createAuthResult(user);
  }

  async loginWithGoogle(idToken: string): Promise<AuthResult> {
    if (!this.googleClient) {
      throw new UnauthorizedException('Google login is not configured');
    }
    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) {
      throw new UnauthorizedException('Google login is not configured');
    }
    let payload: { email?: string; sub: string };
    try {
      const ticket = await this.googleClient.verifyIdToken({
        idToken,
        audience: clientId,
      });
      payload = ticket.getPayload() as { email?: string; sub: string };
    } catch {
      throw new UnauthorizedException('Invalid Google token');
    }
    const email = payload.email;
    if (!email) {
      throw new UnauthorizedException('Google account has no email');
    }
    const providerAccountId = payload.sub;
    const account = await this.prisma.account.findUnique({
      where: {
        provider_providerAccountId: {
          provider: 'google',
          providerAccountId,
        },
      },
      include: { user: true },
    });
    if (account) {
      return this.createAuthResult(account.user);
    }
    let user = await this.prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });
    if (!user) {
      user = await this.prisma.user.create({
        data: {
          email: email.toLowerCase(),
          role: UserRole.fan,
          accounts: {
            create: {
              provider: 'google',
              providerAccountId,
            },
          },
        },
      });
    } else {
      await this.prisma.account.create({
        data: {
          userId: user.id,
          provider: 'google',
          providerAccountId,
        },
      });
    }
    return this.createAuthResult(user);
  }

  async validateUserById(userId: string) {
    return this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, role: true },
    });
  }

  private createAuthResult(user: {
    id: string;
    email: string;
    role: UserRole;
    username?: string | null;
  }): AuthResult {
    const username = user.username?.trim() || undefined;
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      ...(username && { username }),
    };
    const access_token = this.jwtService.sign(payload, { expiresIn: '7d' });
    return {
      access_token,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        ...(username && { username }),
      },
    };
  }
}
