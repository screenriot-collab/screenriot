import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '.prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { InviteUserDto } from './dto/invite-user.dto';
import { AdminUsersService } from './admin-users.service';

@ApiTags('admin-users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminUsersController {
  constructor(private readonly adminUsers: AdminUsersService) {}

  @Get()
  @Roles(UserRole.super_admin, UserRole.admin, UserRole.manager)
  list() {
    return this.adminUsers.list();
  }

  @Post('invite')
  @Roles(UserRole.super_admin, UserRole.admin)
  invite(@Body() dto: InviteUserDto) {
    return this.adminUsers.invite(dto);
  }

  @Delete(':id')
  @Roles(UserRole.super_admin, UserRole.admin)
  delete(
    @Param('id') id: string,
    @CurrentUser() currentUser: { id: string; role: string },
  ) {
    return this.adminUsers.delete(id, currentUser);
  }
}
