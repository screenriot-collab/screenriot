import { Controller, Get, Patch, Param, Query, Body, UseGuards } from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { UserRole } from '.prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { AdminSiteUsersService } from './admin-site-users.service';
import { ListSiteUsersDto } from './dto/list-site-users.dto';
import { UpdateSiteUserDto } from './dto/update-site-user.dto';

@ApiTags('admin-site-users')
@Controller('admin/site-users')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.super_admin, UserRole.admin)
export class AdminSiteUsersController {
  constructor(private readonly siteUsers: AdminSiteUsersService) {}

  @Get()
  list(@Query() dto: ListSiteUsersDto) {
    return this.siteUsers.list(dto);
  }

  @Get(':id')
  getDetail(@Param('id') id: string) {
    return this.siteUsers.getDetail(id);
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() dto: UpdateSiteUserDto,
    @CurrentUser('id') adminId: string,
  ) {
    return this.siteUsers.update(id, dto, adminId);
  }
}
