import { Body, Controller, Post } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AuthService } from '../auth/auth.service';
import { AdminLoginDto } from './dto/admin-login.dto';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';
import { AdminResetPasswordDto } from './dto/reset-password.dto';

@ApiTags('admin-auth')
@Controller('admin/auth')
export class AdminAuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  async login(@Body() dto: AdminLoginDto) {
    return this.authService.adminLogin(dto.username, dto.password);
  }

  @Post('forgot-password')
  async forgotPassword(@Body() dto: ForgotPasswordDto) {
    return this.authService.adminForgotPassword(dto.email);
  }

  @Post('accept-invite')
  async acceptInvite(@Body() dto: AcceptInviteDto) {
    return this.authService.acceptAdminInvite(dto.token, dto.password);
  }

  @Post('reset-password')
  async resetPassword(@Body() dto: AdminResetPasswordDto) {
    return this.authService.adminResetPassword(dto.token, dto.newPassword);
  }
}
