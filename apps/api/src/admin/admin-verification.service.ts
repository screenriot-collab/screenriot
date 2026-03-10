import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { VerificationStatus, DocReviewStatus } from '.prisma/client';
import { ReviewAction } from './dto/review-verification.dto';

@Injectable()
export class AdminVerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async list(
    status?: VerificationStatus,
    page = 1,
    limit = 20,
  ) {
    const where = status ? { status } : { status: { not: VerificationStatus.not_started } };
    const skip = (page - 1) * limit;

    const [verifications, total] = await this.prisma.$transaction([
      this.prisma.userVerification.findMany({
        where,
        skip,
        take: limit,
        orderBy: { submittedAt: 'desc' },
        include: {
          user: { select: { id: true, email: true, displayName: true, role: true } },
          _count: { select: { documents: true } },
        },
      }),
      this.prisma.userVerification.count({ where }),
    ]);

    return {
      verifications: verifications.map((v) => ({
        id: v.id,
        status: v.status,
        submittedAt: v.submittedAt?.toISOString() ?? null,
        reviewedAt: v.reviewedAt?.toISOString() ?? null,
        documentsCount: v._count.documents,
        user: v.user,
      })),
      total,
      page,
      limit,
    };
  }

  async getDetail(verificationId: string) {
    const verification = await this.prisma.userVerification.findUnique({
      where: { id: verificationId },
      include: {
        user: { select: { id: true, email: true, displayName: true, role: true, firstName: true, lastName: true } },
        documents: { orderBy: { uploadedAt: 'desc' } },
      },
    });

    if (!verification) throw new NotFoundException('Verification not found');

    const documents = await Promise.all(
      verification.documents.map(async (doc) => ({
        id: doc.id,
        type: doc.type,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        uploadedAt: doc.uploadedAt.toISOString(),
        status: doc.status,
        adminComment: doc.adminComment,
        url: await this.s3.getPresignedUrl(doc.fileKey),
      })),
    );

    return {
      verification: {
        id: verification.id,
        status: verification.status,
        adminFeedback: verification.adminFeedback,
        submittedAt: verification.submittedAt?.toISOString() ?? null,
        reviewedAt: verification.reviewedAt?.toISOString() ?? null,
        user: verification.user,
        documents,
      },
    };
  }

  async review(
    verificationId: string,
    adminId: string,
    action: ReviewAction,
    adminFeedback?: string,
  ) {
    const verification = await this.prisma.userVerification.findUnique({
      where: { id: verificationId },
    });

    if (!verification) throw new NotFoundException('Verification not found');

    if (action === ReviewAction.approve && verification.status !== VerificationStatus.pending) {
      throw new BadRequestException(
        `Can only approve verifications with status "pending", current: "${verification.status}"`,
      );
    }

    if (
      action === ReviewAction.reject &&
      verification.status !== VerificationStatus.pending &&
      verification.status !== VerificationStatus.verified
    ) {
      throw new BadRequestException(
        `Can only reject verifications with status "pending" or "verified", current: "${verification.status}"`,
      );
    }

    const newStatus =
      action === ReviewAction.approve
        ? VerificationStatus.verified
        : VerificationStatus.rejected;

    await this.prisma.userVerification.update({
      where: { id: verificationId },
      data: {
        status: newStatus,
        adminFeedback: adminFeedback ?? null,
        reviewedAt: new Date(),
        reviewedById: adminId,
      },
    });

    return this.getDetail(verificationId);
  }

  async reviewDocument(
    verificationId: string,
    documentId: string,
    action: ReviewAction,
    adminComment?: string,
  ) {
    const doc = await this.prisma.verificationDocument.findFirst({
      where: { id: documentId, verificationId },
    });

    if (!doc) throw new NotFoundException('Document not found');

    const newStatus =
      action === ReviewAction.approve
        ? DocReviewStatus.approved
        : DocReviewStatus.rejected;

    await this.prisma.verificationDocument.update({
      where: { id: documentId },
      data: { status: newStatus, adminComment: adminComment ?? null },
    });

    return this.getDetail(verificationId);
  }
}
