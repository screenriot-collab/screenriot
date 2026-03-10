import { Injectable, NotFoundException, BadRequestException, ForbiddenException } from '@nestjs/common';
import { VerificationStatus } from '.prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { UpdateProfileDto } from './dto/update-profile.dto';

const IDENTITY_FIELDS: (keyof UpdateProfileDto)[] = [
  'firstName', 'lastName', 'phone', 'dateOfBirth', 'country', 'city',
];

@Injectable()
export class UsersService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async getProfile(userId: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        filmmakerProfile: true,
        verification: {
          include: { documents: { orderBy: { uploadedAt: 'desc' } } },
        },
      },
    });

    if (!user) throw new NotFoundException('User not found');

    const avatarUrl = user.avatarKey
      ? await this.s3.getPresignedUrl(user.avatarKey)
      : null;

    const docUrls = new Map<string, string>();
    if (user.verification?.documents) {
      for (const doc of user.verification.documents) {
        docUrls.set(doc.id, await this.s3.getPresignedUrl(doc.fileKey));
      }
    }

    return {
      profile: {
        firstName: user.firstName,
        lastName: user.lastName,
        displayName: user.displayName,
        email: user.email,
        emailVerifiedAt: user.emailVerifiedAt?.toISOString() ?? null,
        phone: user.phone,
        dateOfBirth: user.dateOfBirth?.toISOString().split('T')[0] ?? null,
        country: user.country,
        city: user.city,
        bio: user.bio,
        website: user.website,
        socialTwitter: user.socialTwitter,
        socialInstagram: user.socialInstagram,
        socialLinkedin: user.socialLinkedin,
        avatarUrl,
        memberSince: user.createdAt.toISOString(),
        role: user.role,
        filmmaker: user.filmmakerProfile
          ? {
              productionCompany: user.filmmakerProfile.productionCompany,
              imdbUrl: user.filmmakerProfile.imdbUrl,
              filmmakerStatement: user.filmmakerProfile.statement,
              yearsOfExperience: user.filmmakerProfile.yearsOfExperience
                ? String(user.filmmakerProfile.yearsOfExperience)
                : '',
              specialization: user.filmmakerProfile.specialization,
            }
          : undefined,
        identityLocked: user.verification?.status === VerificationStatus.verified
          || user.verification?.status === VerificationStatus.pending,
        verification: user.verification
          ? {
              status: user.verification.status,
              adminFeedback: user.verification.adminFeedback,
              submittedAt: user.verification.submittedAt?.toISOString() ?? null,
              reviewedAt: user.verification.reviewedAt?.toISOString() ?? null,
              documents: user.verification.documents.map((doc) => ({
                id: doc.id,
                type: doc.type,
                fileName: doc.fileName,
                fileSize: doc.fileSize,
                uploadedAt: doc.uploadedAt.toISOString(),
                status: doc.status,
                adminComment: doc.adminComment,
                url: docUrls.get(doc.id) ?? null,
              })),
            }
          : { status: 'not_started', documents: [] },
      },
    };
  }

  async updateProfile(userId: string, dto: UpdateProfileDto) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, role: true },
    });
    if (!user) throw new NotFoundException('User not found');

    const verification = await this.prisma.userVerification.findUnique({
      where: { userId },
      select: { status: true },
    });

    const identityLocked =
      verification?.status === VerificationStatus.verified ||
      verification?.status === VerificationStatus.pending;

    if (identityLocked) {
      const attempted = IDENTITY_FIELDS.filter((f) => dto[f] !== undefined);
      if (attempted.length > 0) {
        throw new ForbiddenException(
          `Cannot change identity fields while verification is ${verification!.status}: ${attempted.join(', ')}`,
        );
      }
    }

    await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...(identityLocked ? {} : {
          firstName: dto.firstName,
          lastName: dto.lastName,
          phone: dto.phone,
          dateOfBirth: dto.dateOfBirth ? new Date(dto.dateOfBirth) : undefined,
          country: dto.country,
          city: dto.city,
        }),
        displayName: dto.displayName,
        bio: dto.bio,
        website: dto.website,
        socialTwitter: dto.socialTwitter,
        socialInstagram: dto.socialInstagram,
        socialLinkedin: dto.socialLinkedin,
      },
    });

    if (dto.filmmaker && user.role === 'filmmaker') {
      await this.prisma.filmmakerProfile.upsert({
        where: { userId },
        create: {
          userId,
          productionCompany: dto.filmmaker.productionCompany,
          imdbUrl: dto.filmmaker.imdbUrl,
          statement: dto.filmmaker.statement,
          yearsOfExperience: dto.filmmaker.yearsOfExperience,
          specialization: dto.filmmaker.specialization ?? [],
        },
        update: {
          productionCompany: dto.filmmaker.productionCompany,
          imdbUrl: dto.filmmaker.imdbUrl,
          statement: dto.filmmaker.statement,
          yearsOfExperience: dto.filmmaker.yearsOfExperience,
          specialization: dto.filmmaker.specialization,
        },
      });
    }

    return this.getProfile(userId);
  }

  async uploadAvatar(
    userId: string,
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { avatarKey: true },
    });

    if (user?.avatarKey) {
      try { await this.s3.delete(user.avatarKey); } catch { /* old file may not exist */ }
    }

    const key = `avatars/${userId}`;
    await this.s3.upload(key, file.buffer, file.mimetype);

    await this.prisma.user.update({
      where: { id: userId },
      data: { avatarKey: key },
    });

    const avatarUrl = await this.s3.getPresignedUrl(key);
    return { avatarUrl };
  }
}
