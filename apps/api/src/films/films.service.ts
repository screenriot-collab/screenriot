import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { FilmStatus, ReviewStatus, Prisma, UserRole } from '.prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { CreateFilmDto } from './dto/create-film.dto';
import { UpdateFilmDto } from './dto/update-film.dto';
import { validatePledgeScores } from './dto/create-pledge-vote.dto';

const SLOTS = ['screenplay', 'poster', 'teaser', 'chain-of-title'] as const;
export type FilmFileSlot = (typeof SLOTS)[number];

/** Key Cast (step3.cast) → Main Characters. Use actorName for name; never pass email to frontend. */
function step3CastToMainCharacters(step3: { cast?: { actorName?: string; actorEmail?: string; role?: string }[] } | null): { id: string; name: string; role: string; description: string; imageUrl: null }[] {
  const cast = step3?.cast ?? [];
  return cast
    .filter((row) => (row.actorName ?? '').trim() || (row.actorEmail ?? '').trim() || (row.role ?? '').trim())
    .map((row, i) => {
      const actorName = (row.actorName ?? '').trim();
      const actorEmail = (row.actorEmail ?? '').trim();
      const name = actorName || (/@/.test(actorEmail) ? '—' : (actorEmail || '—'));
      return {
        id: `cast-${i}`,
        name,
        role: (row.role ?? '').trim() || '—',
        description: '',
        imageUrl: null,
      };
    });
}

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
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

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
          rating: true,
          cachedVotesCount: true,
          cachedAverageScore: true,
          _count: { select: { donations: true } },
        },
      }),
      this.prisma.film.count({ where }),
    ]);

    const items = await Promise.all(
      films.map(async (f) => {
        const goal = Number(f.goalAmount) || 0;
        const current = Number(f.currentAmount) || 0;
        const progress = goal > 0 ? Math.round((current / goal) * 100) : 0;
        const daysLeft = f.deadline
          ? Math.max(0, Math.ceil((f.deadline.getTime() - Date.now()) / (24 * 60 * 60 * 1000)))
          : null;
        const ratingNum = f.cachedAverageScore != null ? Number(f.cachedAverageScore) : (f.rating ? parseFloat(f.rating) : null);
        const posterUrl =
          f.posterUrl ?? (f.posterKey ? await this.s3.getPresignedUrl(f.posterKey) : undefined);
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
          rating: ratingNum ?? undefined,
          posterUrl: posterUrl ?? undefined,
        };
      }),
    );

    return { films: items, total, page, limit };
  }

  /** Public detail by slug: full film for detail page */
  async findBySlug(slug: string) {
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
    pageContent.pledgeVoting = {
      title: pledgeVotingFromPage?.title ?? 'Pledge-Based Voting',
      subtitle: pledgeVotingFromPage?.subtitle ?? '',
      pledgeAmount: pledgeVotingFromPage?.pledgeAmount ?? 25,
      categories: enrichedCategories,
    };

    // Main Characters: only from Edit film page (pageContent). Fallback to step3.cast when empty. Never send actorEmail to frontend.
    const fromPage = pageContent.mainCharacters as { id: string; name: string; role: string; description?: string; imageUrl?: string | null; actorEmail?: string }[] | undefined;
    const step3 = film.step3 as { cast?: { actorName?: string; actorEmail?: string; role?: string }[] } | null;
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

    return {
      film: {
        id: film.id,
        slug: film.slug,
        title: film.title,
        synopsis: film.synopsis ?? undefined,
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
      },
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

    const { step3, step4, submissionFeePaid, ...rest } = dto;

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
        submissionFeePaid: submissionFeePaid ?? undefined,
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

  async paySubmissionFee(filmId: string, userId: string) {
    const film = await this.prisma.film.findUnique({ where: { id: filmId } });
    if (!film) throw new NotFoundException('Film not found');
    if (film.filmmakerId !== userId) throw new ForbiddenException('Forbidden');
    if (film.submissionFeePaid)
      throw new BadRequestException('Submission fee already paid');
    if (film.status !== FilmStatus.draft)
      throw new BadRequestException('Only draft films can be paid for');

    const updated = await this.prisma.film.update({
      where: { id: filmId },
      data: {
        submissionFeePaid: true,
        status: FilmStatus.pending_approval,
      },
    });
    return { film: updated };
  }

  isValidSlot(slot: string): slot is FilmFileSlot {
    return SLOTS.includes(slot as FilmFileSlot);
  }

  async createCastingVote(filmId: string, userId: string, optionId: string) {
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
    const cast = tabSection?.castingVote?.cast ?? [];
    const normalizedOptionId = optionId.trim();
    if (!normalizedOptionId) {
      throw new BadRequestException('Option id is required');
    }
    const existsInPage = cast.some((c) => (c?.id ?? '').trim() === normalizedOptionId);
    if (!existsInPage) {
      throw new BadRequestException('Invalid casting option');
    }

    const existing = await this.prisma.filmCastingVote.findFirst({
      where: { filmId, userId, optionId: normalizedOptionId },
    });
    if (existing) {
      throw new BadRequestException('You have already voted for this candidate');
    }

    await this.prisma.filmCastingVote.create({
      data: {
        filmId,
        userId,
        optionId: normalizedOptionId,
      },
    });

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

  async createPledgeVote(filmId: string, userId: string, scores: Record<string, number>) {
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

    await this.prisma.filmPledgeVote.upsert({
      where: {
        filmId_userId: { filmId, userId },
      },
      create: { filmId, userId, scores: normalizedScores as unknown as Prisma.InputJsonValue },
      update: { scores: normalizedScores as unknown as Prisma.InputJsonValue },
    });

    return { ok: true };
  }

  async getMyPledgeVote(filmId: string, userId: string) {
    const film = await this.prisma.film.findUnique({ where: { id: filmId } });
    if (!film) throw new NotFoundException('Film not found');

    const vote = await this.prisma.filmPledgeVote.findUnique({
      where: { filmId_userId: { filmId, userId } },
      select: { scores: true },
    });

    if (!vote) return { scores: null };
    return { scores: vote.scores as Record<string, number> };
  }
}
