import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, FilmStatus } from '.prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { ListFilmsQueryDto } from './dto/list-films.dto';
import { UpdateFilmReviewDto } from './dto/update-film-review.dto';
import { UpdateFilmPageDto } from './dto/update-film-page.dto';
import {
  step3CastToMainCharacters,
  wishListToCastingVoteOptions,
  type Step3Shape,
} from '../films/cast-step3.util';
import { FILE_SLOT_RULES, type FilmFileSlot } from '../films/films.service';

const PUBLISHED_STATUSES: FilmStatus[] = [
  FilmStatus.approved,
  FilmStatus.fundraising,
  FilmStatus.funded,
  FilmStatus.closed,
];

@Injectable()
export class AdminFilmsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async list(query: ListFilmsQueryDto) {
    const page = query.page ?? 1;
    const limit = query.limit ?? 20;

    const where: Prisma.FilmWhereInput = {};
    if (query.published) {
      where.status = { in: PUBLISHED_STATUSES };
    } else if (query.status) {
      where.status = query.status;
    }
    if (query.search) {
      where.OR = [
        { title: { contains: query.search, mode: 'insensitive' } },
        { slug: { contains: query.search, mode: 'insensitive' } },
        { filmmaker: { email: { contains: query.search, mode: 'insensitive' } } },
      ];
    }

    const [films, total] = await Promise.all([
      this.prisma.film.findMany({
        where,
        orderBy: { updatedAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        select: {
          id: true,
          slug: true,
          title: true,
          status: true,
          reviewStatus: true,
          submissionFeePaid: true,
          pagePublished: true,
          createdAt: true,
          updatedAt: true,
          filmmaker: { select: { id: true, email: true } },
          lastReviewedBy: { select: { id: true, username: true } },
        },
      }),
      this.prisma.film.count({ where }),
    ]);

    return { films, total, page, limit };
  }

  async getOne(id: string) {
    const film = await this.prisma.film.findUnique({
      where: { id },
      include: {
        filmmaker: { select: { id: true, email: true } },
        lastReviewedBy: { select: { id: true, username: true } },
      },
    });
    if (!film) throw new NotFoundException('Film not found');

    const presign = (key: string | null | undefined) =>
      key ? this.s3.getPresignedUrl(key) : Promise.resolve(null);

    const [screenplayUrl, posterUrl, teaserUrl, chainOfTitleUrl] = await Promise.all([
      presign(film.screenplayKey),
      presign(film.posterKey),
      presign(film.videoKey),
      presign(film.chainOfTitleKey),
    ]);

    const files = {
      screenplay: film.screenplayKey ? { key: film.screenplayKey, url: screenplayUrl! } : null,
      poster: film.posterKey ? { key: film.posterKey, url: posterUrl! } : null,
      teaser: film.videoKey ? { key: film.videoKey, url: teaserUrl! } : null,
      chainOfTitle: film.chainOfTitleKey ? { key: film.chainOfTitleKey, url: chainOfTitleUrl! } : null,
    };

    let filmWithVotes = await this.enrichCastingVoteCounts(id, film);
    filmWithVotes = await this.enrichPledgeVotingScores(id, filmWithVotes);
    return { film: filmWithVotes, files };
  }

  /** Enriches pageContent.pledgeVoting.categories with communityScore from FilmPledgeVote. */
  private async enrichPledgeVotingScores(
    filmId: string,
    film: { pageContent?: unknown },
  ): Promise<typeof film> {
    const pc = film.pageContent as Record<string, unknown> | null | undefined;
    const pledgeVoting = pc?.pledgeVoting as { categories?: { id?: string; communityScore?: number; communityMax?: number }[] } | undefined;
    const categories = pledgeVoting?.categories;
    if (!Array.isArray(categories) || categories.length === 0) return film;

    const votes = await this.prisma.filmPledgeVote.findMany({
      where: { filmId },
      select: { scores: true },
    });
    const categoryIds = categories.map((c) => (c.id ?? '').trim()).filter(Boolean);
    const sums: Record<string, number> = {};
    const counts: Record<string, number> = {};
    categoryIds.forEach((id) => {
      sums[id] = 0;
      counts[id] = 0;
    });
    for (const row of votes) {
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
      return { ...cat, communityScore, communityMax: COMMUNITY_MAX };
    });
    const newPledgeVoting = { ...pledgeVoting, categories: enrichedCategories };
    const newPc = { ...pc, pledgeVoting: newPledgeVoting };
    return { ...film, pageContent: newPc };
  }

  /** Enriches pageContent.tabbedSection.castingVote.cast with real vote counts from DB. */
  private async enrichCastingVoteCounts(
    filmId: string,
    film: { pageContent?: unknown },
  ): Promise<typeof film> {
    const pc = film.pageContent as Record<string, unknown> | null | undefined;
    const tab = pc?.tabbedSection as Record<string, unknown> | undefined;
    const casting = tab?.castingVote as { cast?: { id?: string; name?: string; role?: string; votes?: number; votePercent?: number }[] } | undefined;
    const cast = casting?.cast;
    if (!Array.isArray(cast) || cast.length === 0) return film;

    const rawVotes = await this.prisma.filmCastingVote.findMany({
      where: { filmId },
      select: { optionId: true },
    });
    const counts: Record<string, number> = {};
    for (const v of rawVotes) {
      counts[v.optionId] = (counts[v.optionId] ?? 0) + 1;
    }
    const totalVotes = rawVotes.length;

    const enrichedCast = cast.map((item) => {
      const id = (item?.id ?? '').trim();
      const votes = id ? (counts[id] ?? 0) : 0;
      const votePercent = totalVotes > 0 ? Math.round((votes / totalVotes) * 100) : 0;
      return { ...item, votes, votePercent };
    });

    const newTab = { ...tab, castingVote: { ...casting, cast: enrichedCast } };
    const newPc = { ...pc, tabbedSection: newTab };
    return { ...film, pageContent: newPc };
  }

  /** Same key pattern as filmmaker: films/{id}/{slot}. Overwrites existing file. */
  async uploadFile(
    id: string,
    slot: string,
    file: Express.Multer.File,
  ): Promise<{ key: string; url: string }> {
    if (slot !== 'poster' && slot !== 'teaser') {
      throw new BadRequestException('Slot must be poster or teaser');
    }
    const film = await this.prisma.film.findUnique({ where: { id } });
    if (!film) throw new NotFoundException('Film not found');
    if (!PUBLISHED_STATUSES.includes(film.status)) {
      throw new BadRequestException('Upload only for approved/fundraising/funded/closed films');
    }

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

    const key = `films/${id}/${slot}`;
    await this.s3.upload(key, file.buffer, file.mimetype);

    const updateData: Prisma.FilmUpdateInput = {};
    if (slot === 'poster') updateData.posterKey = key;
    if (slot === 'teaser') updateData.videoKey = key;
    await this.prisma.film.update({ where: { id }, data: updateData });

    const url = await this.s3.getPresignedUrl(key);
    return { key, url };
  }

  async downloadFile(id: string, slot: string) {
    const film = await this.prisma.film.findUnique({ where: { id } });
    if (!film) throw new NotFoundException('Film not found');

    const slotKeyMap: Record<string, string | null> = {
      screenplay: film.screenplayKey,
      poster: film.posterKey,
      teaser: film.videoKey,
      'chain-of-title': film.chainOfTitleKey,
    };

    if (!(slot in slotKeyMap)) throw new BadRequestException('Invalid slot');

    const key = slotKeyMap[slot];
    if (!key) throw new NotFoundException('File not found');

    const obj = await this.s3.getObject(key);
    const filename = key.split('/').pop() ?? 'file';
    return { body: obj.body, contentType: obj.contentType, filename };
  }

  async updateReview(id: string, dto: UpdateFilmReviewDto, adminId: string) {
    const existing = await this.prisma.film.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Film not found');

    if (dto.status === FilmStatus.approved && !existing.submissionFeePaid) {
      throw new BadRequestException(
        'Cannot approve: submission fee has not been paid. The filmmaker must complete payment first.',
      );
    }

    const updated = await this.prisma.film.update({
      where: { id },
      data: {
        status: dto.status ?? undefined,
        reviewStatus: dto.reviewStatus ?? undefined,
        reviewComments: (dto.reviewComments as Prisma.InputJsonValue) ?? undefined,
        lastReviewedById: adminId,
        ...(dto.status === FilmStatus.rejected ? { pagePublished: false } : {}),
      },
    });

    if (dto.status === FilmStatus.approved && !existing.pageContent) {
      await this.initializeFilmPageFromApplication(id);
    }

    return { film: updated };
  }

  /**
   * One-time copy from application (step3, step4, synopsis) to pageContent when approving.
   */
  private async initializeFilmPageFromApplication(filmId: string) {
    const film = await this.prisma.film.findUnique({ where: { id: filmId } });
    if (!film || film.pageContent) return;

    const step3 = film.step3 as Step3Shape | null;
    const mainCharacters = step3CastToMainCharacters(step3);
    const castingVoteCast = wishListToCastingVoteOptions(step3?.wishListCast ?? null);

    // budgetBreakdown is not stored here; public API reads it from step4.breakdown
    const pageContent: Record<string, unknown> = {
      tags: film.genre ? [film.genre] : [],
      tabbedSection: {
        synopsis: {
          storySynopsis: film.synopsis ?? '',
          whyMatters: '',
        },
        castingVote: {
          title: 'Vote for Your Dream Cast',
          subtitle: '',
          cast: castingVoteCast,
          tip: '',
        },
        production: { title: 'Production Timeline', stages: [] },
        updates: { items: [] },
      },
      treatment: { act1: film.synopsis ?? '', act2: '' },
      mainCharacters,
      sampleScenes: {
        title: 'Script Sample',
        unlockMessage: 'Sample scenes will be published when the filmmaker adds them.',
        description: '',
      },
      pledgeVoting: {
        title: 'Fan Voting',
        subtitle: 'Rate this project and vote for your dream cast • Voting is free',
        categories: [
          { id: 'story', label: 'Story Uniqueness', icon: 'story', labelLeft: 'Not Unique', labelRight: 'Highly Original' },
          { id: 'script', label: 'Script Brilliance', icon: 'script', labelLeft: 'Needs Work', labelRight: 'Exceptional' },
          { id: 'casting', label: 'Casting Appeal', icon: 'casting', labelLeft: 'Weak', labelRight: 'Perfect Cast' },
        ],
      },
      sidebar: {
        tiers: [],
      },
    };

    await this.prisma.film.update({
      where: { id: filmId },
      data: { pageContent: pageContent as Prisma.InputJsonValue },
    });
  }

  async updateFilmPage(id: string, dto: UpdateFilmPageDto) {
    const existing = await this.prisma.film.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Film not found');
    if (!PUBLISHED_STATUSES.includes(existing.status)) {
      throw new BadRequestException('Film page can only be edited for approved/fundraising/funded/closed films');
    }

    const data: Prisma.FilmUpdateInput = {};
    // Slug is set from application and cannot be changed via film page edit
    if (dto.title !== undefined) data.title = dto.title.trim();
    if (dto.synopsis !== undefined) data.synopsis = dto.synopsis.trim() || null;
    if (dto.directorName !== undefined) data.directorName = dto.directorName.trim() || null;
    if (dto.genre !== undefined) data.genre = dto.genre.trim() || null;
    if (dto.goalAmount !== undefined) data.goalAmount = dto.goalAmount;
    if (dto.deadline !== undefined) data.deadline = dto.deadline ? new Date(dto.deadline) : null;
    if (dto.posterUrl !== undefined) data.posterUrl = dto.posterUrl.trim() || null;
    if (dto.pageContent !== undefined) data.pageContent = dto.pageContent as Prisma.InputJsonValue;
    if (dto.trendingText !== undefined) data.trendingText = dto.trendingText.trim() || null;
    if (dto.cachedVotesCount !== undefined) data.cachedVotesCount = dto.cachedVotesCount;
    if (dto.cachedAverageScore !== undefined) data.cachedAverageScore = dto.cachedAverageScore;
    if (dto.pagePublished !== undefined) data.pagePublished = dto.pagePublished;

    const updated = await this.prisma.film.update({
      where: { id },
      data,
    });
    return { film: updated };
  }
}
