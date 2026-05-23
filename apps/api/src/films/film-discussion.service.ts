import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { FilmStatus } from '.prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { assertVerifiedParticipant } from '../auth/require-verified-participant';
import {
  authorInitials,
  formatCommunityAuthorName,
} from './pledge-vote.util';

export type DiscussionSort = 'top' | 'new' | 'trending';

export interface DiscussionCommentDto {
  id: string;
  author: string;
  authorInitials: string;
  content: string;
  upvotes: number;
  createdAt: string;
  isRoot: boolean;
  hasUpvoted: boolean;
  replies: DiscussionCommentDto[];
}

type CommentRow = {
  id: string;
  parentId: string | null;
  rootId: string;
  body: string;
  upvoteCount: number;
  createdAt: Date;
  user: {
    displayName: string | null;
    firstName: string | null;
    lastName: string | null;
  };
};

@Injectable()
export class FilmDiscussionService {
  constructor(private readonly prisma: PrismaService) {}

  private async assertFilmDiscussionAllowed(filmId: string) {
    const film = await this.prisma.film.findUnique({ where: { id: filmId } });
    if (!film) throw new NotFoundException('Film not found');
    const allowed: FilmStatus[] = [FilmStatus.approved, FilmStatus.fundraising];
    if (!allowed.includes(film.status) || !film.pagePublished) {
      throw new BadRequestException(
        'Discussion is available only on published approved or fundraising films',
      );
    }
    return film;
  }

  async list(
    filmId: string,
    params: { sort?: DiscussionSort; page?: number; limit?: number },
    viewerUserId?: string,
  ) {
    await this.assertFilmDiscussionAllowed(filmId);

    const sort = params.sort ?? 'top';
    const page = Math.max(1, params.page ?? 1);
    const limit = Math.min(50, Math.max(1, params.limit ?? 20));
    const skip = (page - 1) * limit;

    const rootWhere = {
      filmId,
      parentId: null,
      deletedAt: null,
    };

    const orderBy =
      sort === 'new'
        ? { createdAt: 'desc' as const }
        : sort === 'trending'
          ? { replyCount: 'desc' as const }
          : { upvoteCount: 'desc' as const };

    const [roots, total] = await this.prisma.$transaction([
      this.prisma.filmDiscussionComment.findMany({
        where: rootWhere,
        orderBy,
        skip,
        take: limit,
        include: {
          user: {
            select: { displayName: true, firstName: true, lastName: true },
          },
        },
      }),
      this.prisma.filmDiscussionComment.count({ where: rootWhere }),
    ]);

    if (roots.length === 0) {
      return { comments: [], total, page, sort };
    }

    const rootIds = roots.map((r) => r.id);

    const upvotedRootIds = viewerUserId
      ? new Set(
          (
            await this.prisma.filmDiscussionUpvote.findMany({
              where: { userId: viewerUserId, commentId: { in: rootIds } },
              select: { commentId: true },
            })
          ).map((u) => u.commentId),
        )
      : new Set<string>();

    const descendants = await this.prisma.filmDiscussionComment.findMany({
      where: {
        rootId: { in: rootIds },
        parentId: { not: null },
        deletedAt: null,
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: { displayName: true, firstName: true, lastName: true },
        },
      },
    });

    const byParent = new Map<string, CommentRow[]>();
    for (const row of descendants) {
      const parentKey = row.parentId ?? '';
      const list = byParent.get(parentKey) ?? [];
      list.push(row);
      byParent.set(parentKey, list);
    }

    const mapRow = (row: CommentRow, isRoot: boolean, hasUpvoted: boolean): DiscussionCommentDto => {
      const author = formatCommunityAuthorName(row.user);
      return {
        id: row.id,
        author,
        authorInitials: authorInitials(author),
        content: row.body,
        upvotes: isRoot ? row.upvoteCount : 0,
        createdAt: row.createdAt.toISOString(),
        isRoot,
        hasUpvoted,
        replies: this.buildReplyTree(row.id, byParent),
      };
    };

    const comments = roots.map((root) =>
      mapRow(root, true, upvotedRootIds.has(root.id)),
    );

    return { comments, total, page, sort };
  }

  private buildReplyTree(
    parentId: string,
    byParent: Map<string, CommentRow[]>,
  ): DiscussionCommentDto[] {
    const children = byParent.get(parentId) ?? [];
    return children.map((row) => {
      const author = formatCommunityAuthorName(row.user);
      return {
        id: row.id,
        author,
        authorInitials: authorInitials(author),
        content: row.body,
        upvotes: 0,
        createdAt: row.createdAt.toISOString(),
        isRoot: false,
        hasUpvoted: false,
        replies: this.buildReplyTree(row.id, byParent),
      };
    });
  }

  async create(filmId: string, userId: string, body: string, parentId?: string) {
    await assertVerifiedParticipant(this.prisma, userId);
    await this.assertFilmDiscussionAllowed(filmId);

    const trimmed = body.trim();
    if (!trimmed) {
      throw new BadRequestException('Comment body is required');
    }

    if (!parentId) {
      const created = await this.prisma.$transaction(async (tx) => {
        const row = await tx.filmDiscussionComment.create({
          data: {
            filmId,
            userId,
            body: trimmed,
            rootId: 'pending',
          },
        });
        return tx.filmDiscussionComment.update({
          where: { id: row.id },
          data: { rootId: row.id },
        });
      });
      return { id: created.id, rootId: created.id };
    }

    const parent = await this.prisma.filmDiscussionComment.findFirst({
      where: { id: parentId, filmId, deletedAt: null },
    });
    if (!parent) {
      throw new BadRequestException('Parent comment not found');
    }

    const rootId = parent.rootId;

    const created = await this.prisma.$transaction(async (tx) => {
      const comment = await tx.filmDiscussionComment.create({
        data: {
          filmId,
          userId,
          parentId,
          rootId,
          body: trimmed,
        },
      });
      await tx.filmDiscussionComment.update({
        where: { id: rootId },
        data: { replyCount: { increment: 1 } },
      });
      return comment;
    });

    return { id: created.id, rootId };
  }

  async toggleUpvote(filmId: string, commentId: string, userId: string) {
    await assertVerifiedParticipant(this.prisma, userId);
    await this.assertFilmDiscussionAllowed(filmId);

    const comment = await this.prisma.filmDiscussionComment.findFirst({
      where: { id: commentId, filmId, deletedAt: null },
    });
    if (!comment) throw new NotFoundException('Comment not found');
    if (comment.parentId) {
      throw new BadRequestException('Only top-level comments can be upvoted');
    }

    const existing = await this.prisma.filmDiscussionUpvote.findUnique({
      where: { commentId_userId: { commentId, userId } },
    });

    if (existing) {
      await this.prisma.$transaction([
        this.prisma.filmDiscussionUpvote.delete({ where: { id: existing.id } }),
        this.prisma.filmDiscussionComment.update({
          where: { id: commentId },
          data: { upvoteCount: { decrement: 1 } },
        }),
      ]);
      return { upvoted: false, upvotes: Math.max(0, comment.upvoteCount - 1) };
    }

    await this.prisma.$transaction([
      this.prisma.filmDiscussionUpvote.create({
        data: { commentId, userId },
      }),
      this.prisma.filmDiscussionComment.update({
        where: { id: commentId },
        data: { upvoteCount: { increment: 1 } },
      }),
    ]);

    return { upvoted: true, upvotes: comment.upvoteCount + 1 };
  }
}
