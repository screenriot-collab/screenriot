import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { CastingSuggestionStatus, Prisma } from '.prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateCastingSuggestionDto } from './dto/update-casting-suggestion.dto';

export interface CastingSuggestionRowDto {
  id: string;
  filmId: string;
  filmTitle: string;
  filmSlug: string;
  userId: string;
  userEmail: string;
  actorName: string;
  roleHint: string | null;
  status: CastingSuggestionStatus;
  adminNote: string | null;
  createdAt: string;
}

export interface CastingSuggestionFilmSummaryDto {
  filmId: string;
  filmTitle: string;
  filmSlug: string;
  total: number;
  pending: number;
  lastSubmittedAt: string;
}

type CastingVoteCastEntry = {
  id?: string;
  name?: string;
  role?: string;
  votePercent?: number;
  votes?: number;
  status?: string;
};

@Injectable()
export class AdminCastingSuggestionsService {
  constructor(private readonly prisma: PrismaService) {}

  async listFilms(params?: {
    status?: string;
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ films: CastingSuggestionFilmSummaryDto[]; total: number }> {
    const page = Math.max(1, params?.page ?? 1);
    const limit = Math.min(100, Math.max(1, params?.limit ?? 20));
    const skip = (page - 1) * limit;

    const statusFilter =
      params?.status &&
      Object.values(CastingSuggestionStatus).includes(params.status as CastingSuggestionStatus)
        ? (params.status as CastingSuggestionStatus)
        : undefined;

    const search = params?.search?.trim();
    const suggestionWhere = {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(search
        ? {
            film: {
              OR: [
                { title: { contains: search, mode: 'insensitive' as const } },
                { slug: { contains: search, mode: 'insensitive' as const } },
              ],
            },
          }
        : {}),
    };

    const rows = await this.prisma.filmCastingSuggestion.findMany({
      where: suggestionWhere,
      select: {
        filmId: true,
        status: true,
        createdAt: true,
        film: { select: { title: true, slug: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    const byFilm = new Map<string, CastingSuggestionFilmSummaryDto>();
    for (const row of rows) {
      let entry = byFilm.get(row.filmId);
      if (!entry) {
        entry = {
          filmId: row.filmId,
          filmTitle: row.film.title,
          filmSlug: row.film.slug,
          total: 0,
          pending: 0,
          lastSubmittedAt: row.createdAt.toISOString(),
        };
        byFilm.set(row.filmId, entry);
      }
      entry.total += 1;
      if (row.status === CastingSuggestionStatus.pending) {
        entry.pending += 1;
      }
      if (row.createdAt.toISOString() > entry.lastSubmittedAt) {
        entry.lastSubmittedAt = row.createdAt.toISOString();
      }
    }

    const films = Array.from(byFilm.values()).sort(
      (a, b) => new Date(b.lastSubmittedAt).getTime() - new Date(a.lastSubmittedAt).getTime(),
    );

    return {
      films: films.slice(skip, skip + limit),
      total: films.length,
    };
  }

  async list(params?: {
    status?: string;
    filmId?: string;
    page?: number;
    limit?: number;
  }): Promise<{ suggestions: CastingSuggestionRowDto[]; total: number }> {
    if (!params?.filmId?.trim()) {
      throw new BadRequestException('filmId is required');
    }

    const page = Math.max(1, params?.page ?? 1);
    const limit = Math.min(100, Math.max(1, params?.limit ?? 30));
    const skip = (page - 1) * limit;

    const statusFilter =
      params?.status &&
      Object.values(CastingSuggestionStatus).includes(params.status as CastingSuggestionStatus)
        ? (params.status as CastingSuggestionStatus)
        : undefined;

    const where = {
      ...(statusFilter ? { status: statusFilter } : {}),
      ...(params?.filmId ? { filmId: params.filmId } : {}),
    };

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.filmCastingSuggestion.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          film: { select: { title: true, slug: true } },
          user: { select: { email: true } },
        },
      }),
      this.prisma.filmCastingSuggestion.count({ where }),
    ]);

    return {
      suggestions: rows.map((row) => ({
        id: row.id,
        filmId: row.filmId,
        filmTitle: row.film.title,
        filmSlug: row.film.slug,
        userId: row.userId,
        userEmail: row.user.email,
        actorName: row.actorName,
        roleHint: row.roleHint,
        status: row.status,
        adminNote: row.adminNote,
        createdAt: row.createdAt.toISOString(),
      })),
      total,
    };
  }

  async update(
    id: string,
    dto: UpdateCastingSuggestionDto,
  ): Promise<{ ok: true; publishedToCast: boolean }> {
    const existing = await this.prisma.filmCastingSuggestion.findUnique({ where: { id } });
    if (!existing) throw new NotFoundException('Suggestion not found');

    const actorName = (dto.actorName ?? existing.actorName).trim();
    const roleHint =
      dto.roleHint !== undefined ? dto.roleHint.trim() || null : existing.roleHint;
    const adminNote = dto.adminNote !== undefined ? dto.adminNote.trim() || null : existing.adminNote;

    if (!actorName) {
      throw new BadRequestException('Actor name is required');
    }

    if (dto.status === CastingSuggestionStatus.accepted && !adminNote) {
      throw new BadRequestException('Admin note is required when accepting a suggestion');
    }

    let publishedToCast = false;
    if (dto.status === CastingSuggestionStatus.accepted) {
      await this.publishSuggestionToDreamCast(existing.filmId, id, actorName, roleHint ?? '');
      publishedToCast = true;
    }

    await this.prisma.filmCastingSuggestion.update({
      where: { id },
      data: {
        status: dto.status,
        actorName,
        roleHint,
        adminNote,
      },
    });

    return { ok: true, publishedToCast };
  }

  private async publishSuggestionToDreamCast(
    filmId: string,
    suggestionId: string,
    actorName: string,
    role: string,
  ): Promise<void> {
    const film = await this.prisma.film.findUnique({ where: { id: filmId } });
    if (!film) throw new NotFoundException('Film not found');

    const pageContent = ((film.pageContent as Record<string, unknown> | null) ?? {}) as Record<
      string,
      unknown
    >;
    const tabSection = ((pageContent.tabbedSection as Record<string, unknown> | undefined) ??
      {}) as Record<string, unknown>;
    const castingVote = ((tabSection.castingVote as Record<string, unknown> | undefined) ??
      {}) as Record<string, unknown>;
    const cast = Array.isArray(castingVote.cast)
      ? ([...castingVote.cast] as CastingVoteCastEntry[])
      : [];

    const castId = `cast-suggestion-${suggestionId}`;
    const entry: CastingVoteCastEntry = {
      id: castId,
      name: actorName,
      role: role || 'Fan suggestion',
      votePercent: 0,
      votes: 0,
      status: 'wish_list',
    };

    const index = cast.findIndex((c) => (c.id ?? '').trim() === castId);
    if (index >= 0) {
      cast[index] = { ...cast[index], ...entry };
    } else {
      cast.push(entry);
    }

    const nextPageContent = {
      ...pageContent,
      tabbedSection: {
        ...tabSection,
        castingVote: {
          title: (castingVote.title as string | undefined) ?? 'Vote for Your Dream Cast',
          subtitle: (castingVote.subtitle as string | undefined) ?? '',
          tip: (castingVote.tip as string | undefined) ?? '',
          ...castingVote,
          cast,
        },
      },
    };

    await this.prisma.film.update({
      where: { id: filmId },
      data: { pageContent: nextPageContent as Prisma.InputJsonValue },
    });
  }
}
