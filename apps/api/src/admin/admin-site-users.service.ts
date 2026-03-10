import { Injectable, NotFoundException, ConflictException } from '@nestjs/common';
import { UserRole, VerificationStatus, Prisma } from '.prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { UpdateSiteUserDto } from './dto/update-site-user.dto';

const SITE_ROLES: UserRole[] = [UserRole.fan, UserRole.filmmaker];

@Injectable()
export class AdminSiteUsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async list(opts: {
    role?: string;
    verificationStatus?: string;
    search?: string;
    page?: number;
    limit?: number;
  }) {
    const page = opts.page ?? 1;
    const limit = opts.limit ?? 20;
    const skip = (page - 1) * limit;

    const where: Prisma.UserWhereInput = {
      role: opts.role && SITE_ROLES.includes(opts.role as UserRole)
        ? (opts.role as UserRole)
        : { in: SITE_ROLES },
    };

    if (opts.verificationStatus) {
      if (opts.verificationStatus === 'not_started') {
        where.OR = [
          { verification: null },
          { verification: { status: 'not_started' } },
        ];
      } else {
        where.verification = { status: opts.verificationStatus as VerificationStatus };
      }
    }

    if (opts.search) {
      const q = opts.search.trim();
      const searchOr = [
        { email: { contains: q, mode: 'insensitive' as const } },
        { displayName: { contains: q, mode: 'insensitive' as const } },
        { firstName: { contains: q, mode: 'insensitive' as const } },
        { lastName: { contains: q, mode: 'insensitive' as const } },
        { username: { contains: q, mode: 'insensitive' as const } },
      ];
      if (where.OR) {
        where.AND = [{ OR: where.OR }, { OR: searchOr }];
        delete where.OR;
      } else {
        where.OR = searchOr;
      }
    }

    const [users, total] = await this.prisma.$transaction([
      this.prisma.user.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          email: true,
          displayName: true,
          firstName: true,
          lastName: true,
          role: true,
          createdAt: true,
          updatedAt: true,
          lastEditedBy: { select: { id: true, username: true } },
          verification: {
            select: {
              id: true,
              status: true,
              reviewedAt: true,
              reviewedBy: { select: { id: true, username: true } },
            },
          },
        },
      }),
      this.prisma.user.count({ where }),
    ]);

    return {
      users: users.map((u) => {
        const editDate = u.lastEditedBy ? u.updatedAt : null;
        const reviewDate = u.verification?.reviewedAt ?? null;

        let lastActionAt: string | null = null;
        let lastActionBy: { id: string; username: string | null } | null = null;

        if (editDate && reviewDate) {
          if (editDate >= reviewDate) {
            lastActionAt = editDate.toISOString();
            lastActionBy = u.lastEditedBy;
          } else {
            lastActionAt = reviewDate.toISOString();
            lastActionBy = u.verification!.reviewedBy;
          }
        } else if (editDate) {
          lastActionAt = editDate.toISOString();
          lastActionBy = u.lastEditedBy;
        } else if (reviewDate) {
          lastActionAt = reviewDate.toISOString();
          lastActionBy = u.verification!.reviewedBy;
        }

        return {
          id: u.id,
          email: u.email,
          displayName: u.displayName,
          firstName: u.firstName,
          lastName: u.lastName,
          role: u.role,
          createdAt: u.createdAt.toISOString(),
          verificationId: u.verification?.id ?? null,
          verificationStatus: u.verification?.status ?? 'not_started',
          lastActionAt,
          lastActionBy,
        };
      }),
      total,
      page,
      limit,
    };
  }

  async getDetail(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        filmmakerProfile: true,
        lastEditedBy: { select: { id: true, username: true } },
        verification: {
          include: {
            documents: { orderBy: { uploadedAt: 'desc' } },
            reviewedBy: { select: { id: true, username: true } },
          },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');
    if (!SITE_ROLES.includes(user.role as UserRole)) {
      throw new NotFoundException('User not found');
    }

    const avatarUrl = user.avatarKey
      ? await this.s3.getPresignedUrl(user.avatarKey)
      : null;

    const documents = user.verification?.documents
      ? await Promise.all(
          user.verification.documents.map(async (doc) => ({
            id: doc.id,
            type: doc.type,
            fileName: doc.fileName,
            fileSize: doc.fileSize,
            uploadedAt: doc.uploadedAt.toISOString(),
            status: doc.status,
            adminComment: doc.adminComment,
            url: await this.s3.getPresignedUrl(doc.fileKey),
          })),
        )
      : [];

    return {
      user: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        country: user.country,
        city: user.city,
        role: user.role,
        bio: user.bio,
        avatarUrl,
        createdAt: user.createdAt.toISOString(),
        lastEditedBy: user.lastEditedBy,
        filmmaker: user.filmmakerProfile
          ? {
              productionCompany: user.filmmakerProfile.productionCompany,
              imdbUrl: user.filmmakerProfile.imdbUrl,
              statement: user.filmmakerProfile.statement,
              yearsOfExperience: user.filmmakerProfile.yearsOfExperience,
              specialization: user.filmmakerProfile.specialization,
            }
          : null,
        verification: user.verification
          ? {
              id: user.verification.id,
              status: user.verification.status,
              adminFeedback: user.verification.adminFeedback,
              submittedAt: user.verification.submittedAt?.toISOString() ?? null,
              reviewedAt: user.verification.reviewedAt?.toISOString() ?? null,
              reviewedBy: user.verification.reviewedBy,
              documents,
            }
          : null,
      },
    };
  }

  async update(userId: string, dto: UpdateSiteUserDto, adminId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new NotFoundException('User not found');
    if (!SITE_ROLES.includes(user.role)) {
      throw new NotFoundException('User not found');
    }

    if (dto.email) {
      const existing = await this.prisma.user.findUnique({
        where: { email: dto.email.toLowerCase() },
      });
      if (existing && existing.id !== userId) {
        throw new ConflictException('Email already registered');
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        firstName: dto.firstName,
        lastName: dto.lastName,
        displayName: dto.displayName,
        email: dto.email ? dto.email.toLowerCase() : undefined,
        phone: dto.phone,
        dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
        country: dto.country,
        city: dto.city,
        bio: dto.bio,
        role: dto.role,
        lastEditedById: adminId,
      },
    });

    return this.getDetail(userId);
  }
}
