import { Controller, Post, Get, Body, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { ContributionsService } from './contributions.service';
import { CreateContributionDto } from './dto/create-contribution.dto';

@ApiTags('contributions')
@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller('contributions')
export class ContributionsController {
  constructor(private readonly contributionsService: ContributionsService) {}

  @ApiOperation({ summary: 'Create a new change request (contribution)' })
  @Post()
  create(@CurrentUser('id') userId: string, @Body() dto: CreateContributionDto) {
    return this.contributionsService.create(userId, dto);
  }

  @ApiOperation({ summary: 'Get current user change requests' })
  @Get('my')
  getMine(@CurrentUser('id') userId: string) {
    return this.contributionsService.getMine(userId);
  }
}
