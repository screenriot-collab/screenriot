import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FilmStatus, ReviewStatus, Prisma, UserRole } from '.prisma/client';
import Stripe from 'stripe';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { validatePledgeScores } from './dto/create-pledge-vote.dto';
import {
  step3CastToMainCharacters,
  wishListToCastingVoteOptions,
  type Step3Shape,
} from './cast-step3.util';
import {
  SCRIPT_CREDITS_PACK_AMOUNT,
  SCRIPT_CREDITS_PACK_PRICE_CENTS,
  SUBMISSION_FEE_CENTS,
  SUBMISSION_FEE_USD,
  STRIPE_CHECKOUT_PURPOSE_SCRIPT_CREDITS,
  STRIPE_CHECKOUT_PURPOSE_SUBMISSION_FEE,
} from './constants';
import {
  buildPublicScriptSample,
  getScriptPageContent,
  getScriptUnlockBlockReason,
} from './script-sample.util';
import { assertVerifiedParticipant } from '../auth/require-verified-participant';
import {
  isStripeCheckoutPaid,
  resolveStripeCheckoutSession,
} from '../donations/stripe-checkout.util';

export type SubmissionFeeFulfillmentResult = {
  applied: boolean;
  filmId: string;
  filmTitle: string;
  userId: string;
  userEmail: string | null;
  stripeSessionId: string;
  amountUsd: number;
};
import {
  authorInitials,
  averagePledgeScores,
  formatCommunityAuthorName,
} from './pledge-vote.util';
import {
  computePledgeCommunityAverage,
  extractCardAiExtras,
  hasAiMarketAnalysis,
  hasScreenplayScoreData,
  resolveCardCommunityScore,
} from './public-film-card.util';

const SLOTS = ['screenplay', 'poster', 'teaser', 'chain-of-title'] as const;
export type FilmFileSlot = (typeof SLOTS)[number];

/** Per-slot upload limits, matching what the submit-project wizard advertises to filmmakers. */
export const FILE_SLOT_RULES: Record<
  FilmFileSlot,
  { label: string; maxSizeBytes: number; mimeTypes: string[] }
> = {
  screenplay: {
    label: 'Screenplay',
    maxSizeBytes: 50 * 1024 * 1024,
    mimeTypes: ['application/pdf'],
  },
  poster: {
    label: 'Poster/Key Art',
    maxSizeBytes: 10 * 1024 * 1024,
    mimeTypes: ['image/jpeg', 'image/png', 'image/webp'],
  },
  teaser: {
    label: 'Teaser/Pitch Video',
    maxSizeBytes: 100 * 1024 * 1024,
    mimeTypes: ['video/mp4'],
  },
  'chain-of-title': {
    label: 'Chain of Title Documentation',
    maxSizeBytes: 10 * 1024 * 1024,
    mimeTypes: ['application/pdf'],
  },
};

function slugify(title: string): string {
  return title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

@Injectable()
export class FilmsService {
  private stripe: Stripe | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (secret) {
      this.stripe = new Stripe(secret);
    }
  }

  async create(dto: CreateFilmDto, filmmakerId: string) {
    const baseSlug = slugify(dto.title) || 'film';
    const slug = await this.ensureUniqueSlug(baseSlug, undefined);
    const film = await this.prisma.film.create({
      data: {
        filmmakerId,
        slug,
        title: dto.title.trim(),
        logline: dto.logline?.trim(),
        synopsis: dto.synopsis?.trim(),
        genre: dto.genre?.trim(),
        runtime: dto.runtime?.trim(),
        rating: dto.rating?.trim(),
        directorName: dto.directorName?.trim(),
        goalAmount: dto.goalAmount ?? 0,
        status: FilmStatus.draft,
        currentAmount: 0,
      },
    });
    return { film };
  }

  async findAllByUser(userId: string, role: UserRole) {
    const where =
      role === UserRole.super_admin || role === UserRole.admin || role === UserRole.manager
        ? {}
        : { filmmakerId: userId };
    const films = await this.prisma.film.findMany({
      where,
      orderBy: { updatedAt: 'desc' },
      select: {
        id: true,
        slug: true,
        title: true,
        status: true,
        reviewStatus: true,
        submissionFeePaid: true,
        pagePublished: true,
        filmmakerId: true,
        filmmaker: { select: { id: true, email: true } },
      },
    });
    return { films };
  }

  async findOneById(id: string, userId: string, role: UserRole) {
    const film = await this.prisma.film.findUnique({ where: { id } });
    if (!film) throw new NotFoundException('Film not found');
    const isOwner = film.filmmakerId === userId;
    const isAdmin =
      role === UserRole.super_admin || role === UserRole.admin || role === UserRole.manager;
    if (!isOwner && !isAdmin) throw new ForbiddenException('Forbidden');
    return { film };
  }

  /** Public list: only approved or fundraising, with pagination and filters */
  async listPublic(params: { page?: number; limit?: number; genre?: string; search?: string }) {
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(100, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const where: Prisma.FilmWhereInput = {
      status: { in: [FilmStatus.approved, FilmStatus.fundraising] },
      pagePublished: true,
    };
    if (params.genre?.trim()) {
      where.genre = { equals: params.genre.trim(), mode: 'insensitive' };
    }
    if (params.search?.trim()) {
      where.OR = [
        { title: { contains: params.search.trim(), mode: 'insensitive' } },
        { synopsis: { contains: params.search.trim(), mode: 'insensitive' } },
      ];
    }

    const [films, total] = await Promise.all([
      this.prisma.film.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          genre: true,
          directorName: true,
          synopsis: true,
          goalAmount: true,
          currentAmount: true,
          deadline: true,
          posterUrl: true,
          posterKey: true,
          cachedVotesCount: true,
          cachedAverageScore: true,
          pageContent: true,
          _count: { select: { donations: true } },
        },
      }),
      this.prisma.film.count({ where }),
    ]);

    const filmIds = films.map((f) => f.id);
    const pledgeVotes =
      filmIds.length > 0
        ? await this.prisma.filmPledgeVote.findMany({
            where: { filmId: { in: filmIds } },
            select: { filmId: true, scores: true },
          })
        : [];
    const votesByFilmId = new Map<string, { scores: unknown }[]>();
    for (const vote of pledgeVotes) {
      const list = votesByFilmId.get(vote.filmId) ?? [];
      list.push({ scores: vote.scores });
      votesByFilmId.set(vote.filmId, list);
    }

    const items = await Promise.all(
      films.map(async (f) => {
        const goal = Number(f.goalAmount) || 0;
        const current = Number(f.currentAmount) || 0;
        const progress = goal > 0 ? Math.round((current / goal) * 100) : 0;
        const daysLeft = f.deadline
          ? Math.max(0, Math.ceil((f.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
          : null;
        const posterUrl =
          f.posterUrl ?? (f.posterKey ? await this.s3.getPresignedUrl(f.posterKey) : undefined);
        const filmVotes = votesByFilmId.get(f.id) ?? [];
        const communityScore = resolveCardCommunityScore(
          f.cachedAverageScore,
          f.pageContent,
          filmVotes,
        );
        const { aiMarketScore, predictedROI } = extractCardAiExtras(f.pageContent);
        const hasCommunityScore = communityScore != null;
        const hasAiMarketScore = aiMarketScore != null;
        const hasPredictedRoi =
          typeof predictedROI === 'string' && predictedROI.length > 0;
        return {
          id: f.id,
          slug: f.slug,
          title: f.title,
          genre: f.genre ?? undefined,
          director: f.directorName ?? undefined,
          synopsis: f.synopsis ?? undefined,
          goalAmount: goal,
          raised: current,
          progress,
          investors: f._count.donations,
          votes: f.cachedVotesCount ?? 0,
          daysLeft: daysLeft ?? undefined,
          rating: hasCommunityScore ? communityScore : undefined,
          posterUrl: posterUrl ?? undefined,
          aiMarketScore: hasAiMarketScore ? aiMarketScore : undefined,
          predictedROI: hasPredictedRoi ? predictedROI : undefined,
          hasCommunityScore,
          hasAiMarketScore,
          hasPredictedRoi,
        };
      }),
    );

    return { films: items, total, page, limit };
  }

  /** Public detail by slug: full film for detail page */
  async findBySlug(slug: string, userId?: string) {
    const film = await this.prisma.film.findFirst({
      where: {
        slug,
        status: { in: [FilmStatus.approved, FilmStatus.fundraising] },
        pagePublished: true,
      },
      include: {
        _count: { select: { donations: true } },
        filmmaker: { select: { avatarKey: true } },
      },
    });
    if (!film) throw new NotFoundException('Film not found');

    const goal = Number(film.goalAmount) || 0;
    const current = Number(film.currentAmount) || 0;
    const progress = goal > 0 ? Math.round((current / goal) * 100) : 0;
    const daysLeft = film.deadline
      ? Math.max(0, Math.ceil((film.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
      : null;

    const pageContent = (film.pageContent as Record<string, unknown> | null)
      ? { ...(film.pageContent as Record<string, unknown>) }
      : {};
    const sidebar = pageContent?.sidebar as Record<string, unknown> | undefined;
    const pledged = current;
    const investorsCount = film._count.donations;

    // budgetBreakdown always from application step4.breakdown
    const step4 = film.step4 as { breakdown?: { label?: string; percent?: number }[] } | null;
    const budgetBreakdown = Array.isArray(step4?.breakdown)
      ? step4!.breakdown.map((b) => ({ label: b?.label ?? '', percent: b?.percent ?? 0 }))
      : [];

    const tabSection = (pageContent.tabbedSection as Record<string, unknown>) ?? {};
    const casting = tabSection.castingVote as
      | {
          title?: string;
          subtitle?: string;
          tip?: string;
          cast?: { id?: string; name?: string; role?: string; votePercent?: number; votes?: number }[];
        }
      | undefined;

    if (casting?.cast && Array.isArray(casting.cast) && casting.cast.length > 0) {
      const rawVotes = await this.prisma.filmCastingVote.findMany({
        where: { filmId: film.id },
        select: { optionId: true },
      });
      const counts = rawVotes.reduce<Record<string, number>>((acc, v) => {
        const key = v.optionId;
        acc[key] = (acc[key] ?? 0) + 1;
        return acc;
      }, {});
      const totalVotes = Object.values(counts).reduce((sum, n) => sum + n, 0);

      const updatedCast = casting.cast.map((option) => {
        const id = (option.id ?? '').trim();
        const votes = id ? counts[id] ?? 0 : 0;
        const votePercent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
        return {
          ...option,
          votes,
          votePercent,
        };
      });

      tabSection.castingVote = {
        ...casting,
        cast: updatedCast,
      };
    }

    const synopsis = (tabSection.synopsis as Record<string, unknown>) ?? {};
    tabSection.synopsis = { ...synopsis, budgetBreakdown };
    pageContent.tabbedSection = tabSection;

    // Pledge voting: use config from pageContent or defaults; always enrich with real communityScore from FilmPledgeVote
    const DEFAULT_PLEDGE_CATEGORIES = [
      { id: 'story', label: 'Story Uniqueness', icon: 'story', labelLeft: 'Not Unique', labelRight: 'Highly Original' },
      { id: 'script', label: 'Script Brilliance', icon: 'script', labelLeft: 'Needs Work', labelRight: 'Exceptional' },
      { id: 'casting', label: 'Casting Appeal', icon: 'casting', labelLeft: 'Weak', labelRight: 'Perfect Cast' },
    ];
    const pledgeVotingFromPage = pageContent.pledgeVoting as
      | { title?: string; subtitle?: string; pledgeAmount?: number; categories?: { id?: string; label?: string; icon?: string; labelLeft?: string; labelRight?: string }[] }
      | undefined;
    const categories = pledgeVotingFromPage?.categories && Array.isArray(pledgeVotingFromPage.categories) && pledgeVotingFromPage.categories.length > 0
      ? pledgeVotingFromPage.categories
      : DEFAULT_PLEDGE_CATEGORIES;
    const categoryIds = categories.map((c) => (c.id ?? '').trim()).filter(Boolean);

    const pledgeVotes = await this.prisma.filmPledgeVote.findMany({
      where: { filmId: film.id },
      select: { scores: true },
    });
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};
    categoryIds.forEach((id) => {
      sums[id] = 0;
      counts[id] = 0;
    });
    for (const row of pledgeVotes) {
      const scores = row.scores as Record<string, number>;
      for (const id of categoryIds) {
        const v = typeof scores[id] === 'number' && !Number.isNaN(scores[id]) ? scores[id]! : 0;
        sums[id] += v;
        counts[id] += 1;
      }
    }
    const COMMUNITY_MAX = 10;
    const enrichedCategories = categories.map((cat) => {
      const id = (cat.id ?? '').trim();
      const n = id ? counts[id] ?? 0 : 0;
      const sum = id ? sums[id] ?? 0 : 0;
      const communityScore = n > 0 ? Math.round((sum / n) * 10) / 10 : 0;
      return {
        ...cat,
        communityScore,
        communityMax: COMMUNITY_MAX,
      };
    });
    const rawSubtitle = pledgeVotingFromPage?.subtitle?.trim() ?? '';
    const subtitle =
      rawSubtitle && !rawSubtitle.includes('$')
        ? rawSubtitle
        : 'Rate this project and vote for your dream cast • Voting is free';
    pageContent.pledgeVoting = {
      title: pledgeVotingFromPage?.title ?? 'Fan Voting',
      subtitle,
      categories: enrichedCategories,
    };

    // Main Characters: only from Edit film page (pageContent). Fallback to step3.cast when empty. Never send actorEmail to frontend.
    const fromPage = pageContent.mainCharacters as { id: string; name: string; role: string; description?: string; imageUrl?: string | null; actorEmail?: string }[] | undefined;
    const step3 = film.step3 as Step3Shape | null;
    if (Array.isArray(fromPage) && fromPage.length > 0) {
      pageContent.mainCharacters = fromPage.map(({ actorEmail: _email, ...c }) => ({
        ...c,
        name: /@/.test(c.name?.trim() ?? '') ? '—' : (c.name ?? '—'),
      }));
    } else {
      pageContent.mainCharacters = step3CastToMainCharacters(step3);
    }

    const posterImageUrl =
      film.posterUrl ?? (film.posterKey ? await this.s3.getPresignedUrl(film.posterKey) : undefined);
    const videoUrl = film.videoKey ? await this.s3.getPresignedUrl(film.videoKey) : undefined;
    const directorAvatarUrl =
      film.filmmaker?.avatarKey ? await this.s3.getPresignedUrl(film.filmmaker.avatarKey) : undefined;
    const hasAiMarketScore = hasAiMarketAnalysis(pageContent);
    const { aiMarketScore } = extractCardAiExtras(pageContent);
    const communityAverage = computePledgeCommunityAverage(pageContent, pledgeVotes);
    const hasCommunityScore =
      pledgeVotes.length > 0 ||
      (film.cachedVotesCount ?? 0) > 0 ||
      communityAverage != null;
    const hasScreenplayScore = hasScreenplayScoreData(pageContent);

    const unlockedPageIds = userId
      ? await this.getUserScriptUnlockPageIds(film.id, userId)
      : new Set<string>();
    const scriptCredits = userId ? await this.getUserScriptCredits(userId) : undefined;
    const publicScriptSample = buildPublicScriptSample(
      pageContent.sampleScenes,
      unlockedPageIds,
      scriptCredits,
    );
    if (publicScriptSample) {
      pageContent.sampleScenes = publicScriptSample;
    } else {
      delete pageContent.sampleScenes;
    }

    return {
      film: {
        id: film.id,
        slug: film.slug,
        title: film.title,
        logline: film.logline ?? undefined,
        synopsis: film.synopsis ?? undefined,
        runtime: film.runtime ?? undefined,
        directorName: film.directorName ?? undefined,
        directorAvatarUrl: directorAvatarUrl ?? undefined,
        genre: film.genre ?? undefined,
        goalAmount: goal,
        currentAmount: current,
        deadline: film.deadline?.toISOString() ?? undefined,
        posterUrl: film.posterUrl ?? undefined,
        posterImageUrl: posterImageUrl ?? undefined,
        videoUrl: videoUrl ?? undefined,
        posterKey: film.posterKey ?? undefined,
        videoKey: film.videoKey ?? undefined,
        rating: film.rating ?? undefined,
        cachedVotesCount: film.cachedVotesCount ?? undefined,
        cachedAverageScore: film.cachedAverageScore != null ? Number(film.cachedAverageScore) : undefined,
        trendingText: film.trendingText ?? undefined,
        hasAiMarketScore,
        aiMarketScore: hasAiMarketScore ? aiMarketScore : undefined,
        hasCommunityScore,
        communityAverageScore: hasCommunityScore ? communityAverage : undefined,
        hasScreenplayScore,
        pageContent: pageContent ?? undefined,
        investorsCount,
        daysLeft,
        progressPercent: progress,
        sidebar: {
          pledged,
          goal,
          investorsCount,
          daysLeft: daysLeft ?? undefined,
          averageScore: film.cachedAverageScore != null ? Number(film.cachedAverageScore) : (film.rating ? parseFloat(film.rating) : undefined),
          votesCount: film.cachedVotesCount ?? 0,
          trendingText: film.trendingText ?? undefined,
          tiers: sidebar?.tiers ?? [],
        },
        communityReviews: await this.listCommunityReviewsForFilm(film.id),
      },
    };
  }

  async listCommunityReviewsForFilm(filmId: string) {
    const votes = await this.prisma.filmPledgeVote.findMany({
      where: { filmId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
    });

    return votes
      .map((vote) => {
        const authorName = formatCommunityAuthorName(vote.user);
        const rating = averagePledgeScores(vote.scores);
        if (rating <= 0) return null;
        return {
          id: vote.id,
          authorName,
          authorInitials: authorInitials(authorName),
          rating,
          reviewText: vote.reviewText?.trim() || null,
          createdAt: vote.createdAt.toISOString(),
        };
      })
      .filter((row): row is NonNullable<typeof row> => row !== null);
  }

  async createCastingSuggestion(
    filmId: string,
    userId: string,
    actorName: string,
    roleHint?: string,
  ) {
    await assertVerifiedParticipant(this.prisma, userId);
    const film = await this.prisma.film.findUnique({ where: { id: filmId } });
    if (!film) throw new NotFoundException('Film not found');
    const allowed: FilmStatus[] = [FilmStatus.approved, FilmStatus.fundraising];
    if (!allowed.includes(film.status) || !film.pagePublished) {
      throw new BadRequestException(
        'Casting suggestions are allowed only for published approved or fundraising films',
      );
    }

    const trimmedName = actorName.trim();
    if (!trimmedName) {
      throw new BadRequestException('Actor name is required');
    }

    const count = await this.prisma.filmCastingSuggestion.count({
      where: { filmId, userId },
    });
    if (count >= 3) {
      throw new BadRequestException('You can suggest up to 3 actors per film');
    }

    const suggestion = await this.prisma.filmCastingSuggestion.create({
      data: {
        filmId,
        userId,
        actorName: trimmedName,
        roleHint: roleHint?.trim() || null,
      },
    });

    return {
      id: suggestion.id,
      actorName: suggestion.actorName,
      status: suggestion.status,
      createdAt: suggestion.createdAt.toISOString(),
    };
  }

  async checkSlug(slug: string, excludeFilmId?: string): Promise<{ available: boolean }> {
    const normalized = slugify(slug) || 'film';
    const existing = await this.prisma.film.findFirst({
      where: {
        slug: normalized,
        ...(excludeFilmId ? { id: { not: excludeFilmId } } : {}),
      },
    });
    return { available: !existing };
  }

  async ensureUniqueSlug(baseSlug: string, excludeFilmId?: string): Promise<string> {
    let candidate = baseSlug;
    let n = 1;
    for (;;) {
      const exists = await this.prisma.film.findFirst({
        where: {
          slug: candidate,
          ...(excludeFilmId ? { id: { not: excludeFilmId } } : {}),
        },
      });
      if (!exists) return candidate;
      candidate = `${baseSlug}-${++n}`;
    }
  }

  async update(id: string, dto: UpdateFilmDto, userId: string, role: UserRole) {
    const existing = await this.prisma.film.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Film not found');
    if (existing.filmmakerId !== userId) throw new ForbiddenException('Forbidden');
    if (existing.status === FilmStatus.approved)
      throw new BadRequestException('Approved film cannot be edited');

    const canChangeSlug =
      existing.status === FilmStatus.draft || existing.status === FilmStatus.pending_approval;
    let slug = existing.slug;
    if (dto.title !== undefined && canChangeSlug) {
      const baseSlug = slugify(dto.title.trim()) || 'film';
      slug = await this.ensureUniqueSlug(baseSlug, id);
    }

    const { step3, step4, submissionFeePaid: _ignoredSubmissionFeePaid, ...rest } = dto;

    const autoReviewSwitch =
      existing.reviewStatus === ReviewStatus.action_required
        ? { reviewStatus: ReviewStatus.changes_submitted }
        : {};

    const film = await this.prisma.film.update({
      where: { id },
      data: {
        ...rest,
        ...(dto.title !== undefined && canChangeSlug ? { slug, title: dto.title.trim() } : {}),
        step3: (step3 as Prisma.InputJsonValue) ?? undefined,
        step4: (step4 as Prisma.InputJsonValue) ?? undefined,
        ...autoReviewSwitch,
      },
    });
    return { film };
  }

  async remove(id: string, userId: string) {
    const film = await this.prisma.film.findUnique({ where: { id } });
    if (!film) throw new NotFoundException('Film not found');
    if (film.filmmakerId !== userId) throw new ForbiddenException('Forbidden');
    if (film.status !== FilmStatus.draft)
      throw new BadRequestException('Only draft films can be deleted');
    await this.prisma.film.delete({ where: { id } });
    return { deleted: true };
  }

  async uploadFile(
    filmId: string,
    slot: string,
    file: Express.Multer.File,
    userId: string,
  ): Promise<{ key: string; url: string }> {
    if (!SLOTS.includes(slot as FilmFileSlot))
      throw new BadRequestException(`Invalid slot. Allowed: ${SLOTS.join(', ')}`);
    const film = await this.prisma.film.findUnique({ where: { id: filmId } });
    if (!film) throw new NotFoundException('Film not found');
    if (film.filmmakerId !== userId) throw new ForbiddenException('Forbidden');
    if (film.status === FilmStatus.approved)
      throw new BadRequestException('Approved film cannot be edited');

    const rule = FILE_SLOT_RULES[slot as FilmFileSlot];
    if (file.size > rule.maxSizeBytes) {
      const maxMb = Math.round(rule.maxSizeBytes / (1024 * 1024));
      const gotMb = (file.size / (1024 * 1024)).toFixed(1);
      throw new BadRequestException(
        `${rule.label} is too large (${gotMb}MB). Maximum allowed size is ${maxMb}MB.`,
      );
    }
    if (!rule.mimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(
        `${rule.label} must be uploaded as ${rule.mimeTypes.join(' or ')} (received ${file.mimetype}).`,
      );
    }

    // Fixed key per slot: overwrite on replace, no duplicate files
    const key = `films/${filmId}/${slot}`;
    await this.s3.upload(key, file.buffer, file.mimetype);

    const updateData: Record<string, string> = {};
    if (slot === 'screenplay') updateData.screenplayKey = key;
    if (slot === 'poster') updateData.posterKey = key;
    if (slot === 'teaser') updateData.videoKey = key;
    if (slot === 'chain-of-title') updateData.chainOfTitleKey = key;

    if (Object.keys(updateData).length > 0) {
      await this.prisma.film.update({
        where: { id: filmId },
        data: updateData as never,
      });
    }
    const url = await this.s3.getPresignedUrl(key);
    return { key, url };
  }

  async createSubmissionFeeCheckoutSession(
    filmId: string,
    userId: string,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }
    const film = await this.getFilmForSubmissionFeePayment(filmId, userId);

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: SUBMISSION_FEE_CENTS,
            product_data: {
              name: `Submission fee: ${film.title}`,
              description: 'Film project submission for review',
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        purpose: STRIPE_CHECKOUT_PURPOSE_SUBMISSION_FEE,
        filmId,
        userId,
      },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    if (!session.url) {
      throw new BadRequestException('Failed to create checkout session');
    }
    return { url: session.url };
  }

  /**
   * Idempotent submission fee fulfillment (webhook, success-page confirm, admin).
   */
  async completeSubmissionFeeFromStripeSession(
    session: Stripe.Checkout.Session,
  ): Promise<SubmissionFeeFulfillmentResult | null> {
    if (session.metadata?.purpose !== STRIPE_CHECKOUT_PURPOSE_SUBMISSION_FEE) {
      return null;
    }
    const filmId = session.metadata?.filmId;
    const userId = session.metadata?.userId;
    if (!filmId || !userId) {
      return null;
    }
    if (!isStripeCheckoutPaid(session)) {
      return null;
    }

    const amountCents = session.amount_total ?? SUBMISSION_FEE_CENTS;
    const amountUsd = amountCents / 100;

    const [existingBySession, existingByFilm, film, user] = await Promise.all([
      this.prisma.submissionFeePayment.findUnique({
        where: { stripeSessionId: session.id },
      }),
      this.prisma.submissionFeePayment.findUnique({ where: { filmId } }),
      this.prisma.film.findUnique({
        where: { id: filmId },
        select: { id: true, title: true, filmmakerId: true, submissionFeePaid: true, status: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      }),
    ]);

    if (!film || film.filmmakerId !== userId) {
      return null;
    }

    const base = {
      filmId,
      filmTitle: film.title,
      userId,
      userEmail: user?.email ?? null,
      stripeSessionId: session.id,
      amountUsd,
    };

    if (existingBySession || existingByFilm || film.submissionFeePaid) {
      if (!film.submissionFeePaid) {
        await this.prisma.film.update({
          where: { id: filmId },
          data: {
            submissionFeePaid: true,
            status: FilmStatus.pending_approval,
          },
        });
      }
      return { applied: false, ...base };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.submissionFeePayment.create({
        data: {
          filmId,
          userId,
          stripeSessionId: session.id,
          amountUsd,
        },
      });
      await tx.film.update({
        where: { id: filmId },
        data: {
          submissionFeePaid: true,
          status: FilmStatus.pending_approval,
        },
      });
    });

    return { applied: true, ...base };
  }

  /**
   * After Stripe redirect: confirm payment if webhook has not run yet.
   */
  async confirmSubmissionFeeCheckout(
    filmId: string,
    userId: string,
    sessionId: string,
  ) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const session = await resolveStripeCheckoutSession(this.stripe, sessionId);
    if (session.metadata?.purpose !== STRIPE_CHECKOUT_PURPOSE_SUBMISSION_FEE) {
      throw new BadRequestException('Invalid checkout session');
    }
    if (session.metadata?.filmId !== filmId || session.metadata?.userId !== userId) {
      throw new BadRequestException('Checkout session does not match this film');
    }
    if (!isStripeCheckoutPaid(session)) {
      throw new BadRequestException('Payment not completed');
    }

    const film = await this.prisma.film.findUnique({ where: { id: filmId } });
    if (!film) throw new NotFoundException('Film not found');
    if (film.filmmakerId !== userId) throw new ForbiddenException('Forbidden');
    if (film.status !== FilmStatus.draft && !film.submissionFeePaid) {
      throw new BadRequestException('Only draft films can be paid for');
    }

    await this.completeSubmissionFeeFromStripeSession(session);

    const updated = await this.prisma.film.findUnique({ where: { id: filmId } });
    if (!updated?.submissionFeePaid) {
      throw new BadRequestException('Payment could not be applied');
    }
    return { film: updated };
  }

  /** Admin support: mark submission fee paid from a Stripe Checkout session (idempotent). */
  async fulfillSubmissionFeeFromStripeSessionAsAdmin(
    stripeId: string,
  ): Promise<SubmissionFeeFulfillmentResult> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const session = await resolveStripeCheckoutSession(this.stripe, stripeId);
    if (session.metadata?.purpose !== STRIPE_CHECKOUT_PURPOSE_SUBMISSION_FEE) {
      throw new BadRequestException('Not a submission fee checkout session');
    }
    if (!isStripeCheckoutPaid(session)) {
      throw new BadRequestException('Payment not completed in Stripe');
    }

    const result = await this.completeSubmissionFeeFromStripeSession(session);
    if (!result) {
      throw new BadRequestException('Could not apply submission fee from this session');
    }
    return result;
  }

  private async getFilmForSubmissionFeePayment(filmId: string, userId: string) {
    const film = await this.prisma.film.findUnique({ where: { id: filmId } });
    if (!film) throw new NotFoundException('Film not found');
    if (film.filmmakerId !== userId) throw new ForbiddenException('Forbidden');
    if (film.submissionFeePaid) {
      throw new BadRequestException('Submission fee already paid');
    }
    if (film.status !== FilmStatus.draft) {
      throw new BadRequestException('Only draft films can be paid for');
    }
    return film;
  }

  isValidSlot(slot: string): slot is FilmFileSlot {
    return SLOTS.includes(slot as FilmFileSlot);
  }

  async getUserScriptCredits(userId: string): Promise<number> {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { scriptCredits: true },
    });
    return user?.scriptCredits ?? 0;
  }

  private async getUserScriptUnlockPageIds(
    filmId: string,
    userId: string,
  ): Promise<Set<string>> {
    const rows = await this.prisma.filmScriptUnlock.findMany({
      where: { filmId, userId },
      select: { pageId: true },
    });
    return new Set(rows.map((r) => r.pageId));
  }

  async unlockScriptPage(filmId: string, userId: string, pageId: string) {
    await assertVerifiedParticipant(this.prisma, userId);
    const film = await this.getPublishedFilmForScript(filmId);
    const pageContent = film.pageContent as Record<string, unknown> | null;
    const sampleScenesRaw = pageContent?.sampleScenes;
    const unlockedPageIds = await this.getUserScriptUnlockPageIds(filmId, userId);

    const blockReason = getScriptUnlockBlockReason(sampleScenesRaw, pageId, unlockedPageIds);
    if (blockReason) {
      throw new BadRequestException(blockReason);
    }

    const page = getScriptPageContent(sampleScenesRaw, pageId);
    if (!page) {
      throw new BadRequestException('Script page not found');
    }

    const config = pageContent as Record<string, unknown>;
    const sample = config?.sampleScenes as { creditsPerPage?: number } | undefined;
    const cost =
      typeof sample?.creditsPerPage === 'number' && sample.creditsPerPage > 0
        ? Math.round(sample.creditsPerPage)
        : 1;

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { scriptCredits: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (user.scriptCredits < cost) {
      throw new BadRequestException(
        `Not enough credits to unlock this page (${cost} required, you have ${user.scriptCredits}).`,
      );
    }

    await this.prisma.$transaction(async (tx) => {
      const updated = await tx.user.updateMany({
        where: { id: userId, scriptCredits: { gte: cost } },
        data: { scriptCredits: { decrement: cost } },
      });
      if (updated.count === 0) {
        throw new BadRequestException(
          `Not enough credits to unlock this page (${cost} required, you have ${user.scriptCredits}).`,
        );
      }
      await tx.filmScriptUnlock.create({
        data: { filmId, userId, pageId },
      });
    });

    const scriptCredits = await this.getUserScriptCredits(userId);
    return { page, scriptCredits };
  }

  async createScriptCreditsCheckout(
    userId: string,
    successUrl: string,
    cancelUrl: string,
  ) {
    await assertVerifiedParticipant(this.prisma, userId);
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      success_url: successUrl,
      cancel_url: cancelUrl,
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: SCRIPT_CREDITS_PACK_PRICE_CENTS,
            product_data: {
              name: 'Script reading credits',
              description: `${SCRIPT_CREDITS_PACK_AMOUNT} credits to unlock screenplay pages`,
            },
          },
          quantity: 1,
        },
      ],
      metadata: {
        purpose: STRIPE_CHECKOUT_PURPOSE_SCRIPT_CREDITS,
        userId,
        credits: String(SCRIPT_CREDITS_PACK_AMOUNT),
      },
    });

    if (!session.url) {
      throw new BadRequestException('Failed to create checkout session');
    }

    return { url: session.url };
  }

  /**
   * Idempotent credit grant from Stripe Checkout (webhook or success-page confirm).
   */
  async completeScriptCreditsFromStripeSession(
    session: Stripe.Checkout.Session,
  ): Promise<{ credited: boolean; creditsAdded: number; scriptCredits: number }> {
    if (session.metadata?.purpose !== STRIPE_CHECKOUT_PURPOSE_SCRIPT_CREDITS) {
      return { credited: false, creditsAdded: 0, scriptCredits: 0 };
    }
    const userId = session.metadata?.userId;
    const creditsRaw = session.metadata?.credits;
    const credits = creditsRaw ? Number.parseInt(creditsRaw, 10) : SCRIPT_CREDITS_PACK_AMOUNT;
    if (!userId || !Number.isFinite(credits) || credits <= 0) {
      return { credited: false, creditsAdded: 0, scriptCredits: 0 };
    }
    if (!isStripeCheckoutPaid(session)) {
      return { credited: false, creditsAdded: 0, scriptCredits: await this.getUserScriptCredits(userId) };
    }

    const existing = await this.prisma.scriptCreditPurchase.findUnique({
      where: { stripeSessionId: session.id },
    });
    if (existing) {
      return {
        credited: false,
        creditsAdded: 0,
        scriptCredits: await this.getUserScriptCredits(userId),
      };
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.scriptCreditPurchase.create({
        data: {
          userId,
          stripeSessionId: session.id,
          credits,
        },
      });
      await tx.user.update({
        where: { id: userId },
        data: { scriptCredits: { increment: credits } },
      });
    });

    return {
      credited: true,
      creditsAdded: credits,
      scriptCredits: await this.getUserScriptCredits(userId),
    };
  }

  /**
   * After Stripe redirect when webhook did not run (common in local dev).
   */
  async confirmScriptCreditsCheckout(userId: string, sessionId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }

    const session = await resolveStripeCheckoutSession(this.stripe, sessionId);
    if (session.metadata?.purpose !== STRIPE_CHECKOUT_PURPOSE_SCRIPT_CREDITS) {
      throw new BadRequestException('Invalid checkout session');
    }
    if (session.metadata?.userId !== userId) {
      throw new BadRequestException('Checkout session does not match your account');
    }
    if (!isStripeCheckoutPaid(session)) {
      throw new BadRequestException('Payment not completed');
    }

    return this.completeScriptCreditsFromStripeSession(session);
  }

  /** Admin support: apply credits from a paid Checkout session (idempotent). */
  async fulfillScriptCreditsFromStripeSessionAsAdmin(stripeId: string) {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }
    const session = await resolveStripeCheckoutSession(this.stripe, stripeId);
    if (session.metadata?.purpose !== STRIPE_CHECKOUT_PURPOSE_SCRIPT_CREDITS) {
      throw new BadRequestException('Not a script credits checkout session');
    }
    if (!isStripeCheckoutPaid(session)) {
      throw new BadRequestException('Payment not completed in Stripe');
    }

    const result = await this.completeScriptCreditsFromStripeSession(session);
    const userId = session.metadata?.userId;
    const user = userId
      ? await this.prisma.user.findUnique({
          where: { id: userId },
          select: { email: true },
        })
      : null;

    return {
      ...result,
      userEmail: user?.email ?? null,
      stripeSessionId: session.id,
    };
  }

  private async getPublishedFilmForScript(filmId: string) {
    const film = await this.prisma.film.findFirst({
      where: {
        id: filmId,
        status: { in: [FilmStatus.approved, FilmStatus.fundraising] },
        pagePublished: true,
      },
      select: { id: true, pageContent: true },
    });
    if (!film) throw new NotFoundException('Film not found');
    return film;
  }

  async createCastingVote(filmId: string, userId: string, optionId: string) {
    await assertVerifiedParticipant(this.prisma, userId);
    const film = await this.prisma.film.findUnique({ where: { id: filmId } });
    if (!film) throw new NotFoundException('Film not found');
    const allowedForVote: FilmStatus[] = [FilmStatus.approved, FilmStatus.fundraising];
    if (!allowedForVote.includes(film.status) || !film.pagePublished) {
      throw new BadRequestException(
        'Casting vote is allowed only for approved or fundraising films published on site',
      );
    }

    const pageContent = (film.pageContent as Record<string, unknown> | null) ?? null;
    const tabSection = pageContent?.tabbedSection as
      | {
          castingVote?: { cast?: { id?: string | null }[] };
        }
      | undefined;
    const cast =
      (tabSection?.castingVote?.cast as { id?: string | null; status?: string | null }[]) ?? [];
    const normalizedOptionId = optionId.trim();
    if (!normalizedOptionId) {
      throw new BadRequestException('Option id is required');
    }
    const option = cast.find((c) => (c?.id ?? '').trim() === normalizedOptionId);
    if (!option) {
      throw new BadRequestException('Invalid casting option');
    }
    if ((option.status ?? 'wish_list') === 'verified') {
      throw new BadRequestException('This cast member is already confirmed and cannot be voted on');
    }

    const existingVote = await this.prisma.filmCastingVote.findUnique({
      where: {
        filmId_userId_optionId: { filmId, userId, optionId: normalizedOptionId },
      },
    });
    if (existingVote) {
      return { ok: true };
    }

    try {
      await this.prisma.filmCastingVote.create({
        data: {
          filmId,
          userId,
          optionId: normalizedOptionId,
        },
      });
    } catch (error) {
      if (
        error instanceof Prisma.PrismaClientKnownRequestError &&
        error.code === 'P2002'
      ) {
        return { ok: true };
      }
      throw error;
    }

    return { ok: true };
  }

  async getMyCastingVotes(filmId: string, userId: string) {
    const film = await this.prisma.film.findUnique({ where: { id: filmId } });
    if (!film) throw new NotFoundException('Film not found');

    const votes = await this.prisma.filmCastingVote.findMany({
      where: { filmId, userId },
      select: { optionId: true },
    });

    return { optionIds: votes.map((v) => v.optionId) };
  }

  async createPledgeVote(
    filmId: string,
    userId: string,
    scores: Record<string, number>,
    reviewText?: string,
  ) {
    await assertVerifiedParticipant(this.prisma, userId);
    const film = await this.prisma.film.findUnique({ where: { id: filmId } });
    if (!film) throw new NotFoundException('Film not found');
    const allowedForVote: FilmStatus[] = [FilmStatus.approved, FilmStatus.fundraising];
    if (!allowedForVote.includes(film.status) || !film.pagePublished) {
      throw new BadRequestException(
        'Pledge vote is allowed only for approved or fundraising films published on site',
      );
    }

    const pc = (film.pageContent as Record<string, unknown> | null) ?? {};
    const pledgeVoting = pc.pledgeVoting as { categories?: { id?: string }[] } | undefined;
    const categories = pledgeVoting?.categories ?? [];
    let categoryIds = categories.map((c) => (c.id ?? '').trim()).filter(Boolean);
    if (categoryIds.length === 0) {
      categoryIds = ['story', 'script', 'casting'];
    }
    const validation = validatePledgeScores(scores, categoryIds);
    if (!validation.valid) {
      throw new BadRequestException(validation.message ?? 'Invalid scores');
    }

    const normalizedScores: Record<string, number> = {};
    for (const id of categoryIds) {
      const v = scores[id];
      normalizedScores[id] = typeof v === 'number' && !Number.isNaN(v) ? Math.max(1, Math.min(10, v)) : 0;
    }

    const trimmedReview = reviewText?.trim() || null;

    await this.prisma.filmPledgeVote.upsert({
      where: {
        filmId_userId: { filmId, userId },
      },
      create: {
        filmId,
        userId,
        scores: normalizedScores as unknown as Prisma.InputJsonValue,
        reviewText: trimmedReview,
      },
      update: {
        scores: normalizedScores as unknown as Prisma.InputJsonValue,
        reviewText: trimmedReview,
      },
    });

    return { ok: true };
  }

  async getMyPledgeVote(filmId: string, userId: string) {
    const film = await this.prisma.film.findUnique({ where: { id: filmId } });
    if (!film) throw new NotFoundException('Film not found');

    const vote = await this.prisma.filmPledgeVote.findUnique({
      where: { filmId_userId: { filmId, userId } },
      select: { scores: true, reviewText: true },
    });

    if (!vote) return { scores: null, reviewText: null };
    return {
      scores: vote.scores as Record<string, number>,
      reviewText: vote.reviewText ?? null,
    };
  }
}
