import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Query,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  ParseFilePipe,
  MaxFileSizeValidator,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { FileInterceptor } from '@nestjs/platform-express';
import { UserRole } from '.prisma/client';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { OptionalJwtAuthGuard } from '../auth/guards/optional-jwt-auth.guard';
import { CurrentUserOptional } from '../auth/decorators/current-user-optional.decorator';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { FilmsService } from './films.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { CheckSlugQueryDto } from './dto/check-slug.dto';
import { ListPublicFilmsDto } from './dto/list-public-films.dto';
import { CreateCastingVoteDto } from './dto/create-casting-vote.dto';
import { CreatePledgeVoteDto } from './dto/create-pledge-vote.dto';
import { CreateSubmissionFeeCheckoutDto } from './dto/create-submission-fee-checkout.dto';
import { ConfirmSubmissionFeeDto } from './dto/confirm-submission-fee.dto';
import { UnlockScriptPageDto } from './dto/unlock-script-page.dto';
import { ScriptCreditsCheckoutDto } from './dto/script-credits-checkout.dto';
import { ConfirmScriptCreditsDto } from './dto/confirm-script-credits.dto';
import { CreateCastingSuggestionDto } from './dto/create-casting-suggestion.dto';
import { FilmDiscussionService } from './film-discussion.service';
import { ListDiscussionQueryDto } from './dto/list-discussion.dto';
import { CreateDiscussionCommentDto } from './dto/create-discussion-comment.dto';
import { MAX_FILE_SIZE } from '../common/constants';

@ApiTags('films')
@Controller('films')
export class FilmsController {
  constructor(
    private readonly films: FilmsService,
    private readonly discussion: FilmDiscussionService,
  ) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  list(@CurrentUser() user: { id: string; role: string }) {
    return this.films.findAllByUser(user.id, user.role as UserRole);
  }

  @Get('public')
  listPublic(@Query() query: ListPublicFilmsDto) {
    return this.films.listPublic({
      page: query.page,
      limit: query.limit,
      genre: query.genre,
      search: query.search,
    });
  }

  @Get('check-slug')
  @UseGuards(JwtAuthGuard)
  checkSlug(@Query() query: CheckSlugQueryDto) {
    return this.films.checkSlug(query.slug, query.excludeFilmId);
  }

  @Get('slug/:slug')
  @UseGuards(OptionalJwtAuthGuard)
  findBySlug(
    @Param('slug') slug: string,
    @CurrentUserOptional() user: { id: string } | null,
  ) {
    return this.films.findBySlug(slug, user?.id);
  }

  @Post(':id/script-sample/unlock')
  @UseGuards(JwtAuthGuard)
  unlockScriptPage(
    @Param('id') id: string,
    @Body() dto: UnlockScriptPageDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.films.unlockScriptPage(id, user.id, dto.pageId);
  }

  @Post('script-credits/checkout')
  @UseGuards(JwtAuthGuard)
  scriptCreditsCheckout(
    @Body() dto: ScriptCreditsCheckoutDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.films.createScriptCreditsCheckout(user.id, dto.successUrl, dto.cancelUrl);
  }

  @Post('script-credits/confirm')
  @UseGuards(JwtAuthGuard)
  confirmScriptCredits(
    @Body() dto: ConfirmScriptCreditsDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.films.confirmScriptCreditsCheckout(user.id, dto.sessionId);
  }

  @Get(':id')
  @UseGuards(JwtAuthGuard)
  findOne(@Param('id') id: string, @CurrentUser() user: { id: string; role: string }) {
    return this.films.findOneById(id, user.id, user.role as UserRole);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.filmmaker)
  create(@Body() dto: CreateFilmDto, @CurrentUser() user: { id: string }) {
    return this.films.create(dto, user.id);
  }

  @Patch(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.filmmaker)
  update(
    @Param('id') id: string,
    @Body() dto: UpdateFilmDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.films.update(id, dto, user.id, UserRole.filmmaker);
  }

  @Delete(':id')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.filmmaker)
  remove(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.films.remove(id, user.id);
  }

  @Post(':id/pay/checkout')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.filmmaker)
  payCheckout(
    @Param('id') id: string,
    @Body() dto: CreateSubmissionFeeCheckoutDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.films.createSubmissionFeeCheckoutSession(
      id,
      user.id,
      dto.successUrl,
      dto.cancelUrl,
    );
  }

  @Post(':id/pay/confirm')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.filmmaker)
  payConfirm(
    @Param('id') id: string,
    @Body() dto: ConfirmSubmissionFeeDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.films.confirmSubmissionFeeCheckout(id, user.id, dto.sessionId);
  }

  @Get(':id/discussion')
  @UseGuards(OptionalJwtAuthGuard)
  listDiscussion(
    @Param('id') id: string,
    @Query() query: ListDiscussionQueryDto,
    @CurrentUserOptional() user: { id: string } | null,
  ) {
    return this.discussion.list(
      id,
      {
        sort: query.sort,
        page: query.page ? parseInt(query.page, 10) : undefined,
        limit: query.limit ? parseInt(query.limit, 10) : undefined,
      },
      user?.id,
    );
  }

  @Post(':id/discussion')
  @UseGuards(JwtAuthGuard)
  createDiscussionComment(
    @Param('id') id: string,
    @Body() dto: CreateDiscussionCommentDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.discussion.create(id, user.id, dto.body, dto.parentId);
  }

  @Post(':id/discussion/:commentId/upvote')
  @UseGuards(JwtAuthGuard)
  toggleDiscussionUpvote(
    @Param('id') id: string,
    @Param('commentId') commentId: string,
    @CurrentUser() user: { id: string },
  ) {
    return this.discussion.toggleUpvote(id, commentId, user.id);
  }

  @Post(':id/casting-suggestions')
  @UseGuards(JwtAuthGuard)
  createCastingSuggestion(
    @Param('id') id: string,
    @Body() dto: CreateCastingSuggestionDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.films.createCastingSuggestion(id, user.id, dto.actorName, dto.roleHint);
  }

  @Post(':id/casting-vote')
  @UseGuards(JwtAuthGuard)
  castingVote(
    @Param('id') id: string,
    @Body() dto: CreateCastingVoteDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.films.createCastingVote(id, user.id, dto.optionId);
  }

  @Get(':id/casting-vote/my')
  @UseGuards(JwtAuthGuard)
  getMyCastingVotes(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.films.getMyCastingVotes(id, user.id);
  }

  @Post(':id/pledge-vote')
  @UseGuards(JwtAuthGuard)
  createPledgeVote(
    @Param('id') id: string,
    @Body() dto: CreatePledgeVoteDto,
    @CurrentUser() user: { id: string },
  ) {
    return this.films.createPledgeVote(id, user.id, dto.scores, dto.reviewText);
  }

  @Get(':id/pledge-vote/my')
  @UseGuards(JwtAuthGuard)
  getMyPledgeVote(@Param('id') id: string, @CurrentUser() user: { id: string }) {
    return this.films.getMyPledgeVote(id, user.id);
  }

  @Post(':id/files/:slot')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.filmmaker)
  @UseInterceptors(FileInterceptor('file'))
  uploadFile(
    @Param('id') id: string,
    @Param('slot') slot: string,
    @UploadedFile(
      new ParseFilePipe({
        validators: [new MaxFileSizeValidator({ maxSize: MAX_FILE_SIZE })],
        fileIsRequired: true,
      }),
    )
    file: Express.Multer.File,
    @CurrentUser() user: { id: string },
  ) {
    return this.films.uploadFile(id, slot, file, user.id);
  }
}
