import {
  Injectable,
  NotFoundException,
  BadRequestException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { S3Service } from '../s3/s3.service';
import { VerificationDocType, VerificationStatus } from '.prisma/client';

@Injectable()
export class VerificationService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly s3: S3Service,
  ) {}

  async getVerification(userId: string) {
    const verification = await this.findOrCreateVerification(userId);

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
        status: verification.status,
        adminFeedback: verification.adminFeedback,
        submittedAt: verification.submittedAt?.toISOString() ?? null,
        reviewedAt: verification.reviewedAt?.toISOString() ?? null,
        documents,
      },
    };
  }

  async uploadDocument(
    userId: string,
    type: VerificationDocType,
    file: Express.Multer.File,
  ) {
    if (!file) throw new BadRequestException('No file provided');

    const verification = await this.findOrCreateVerification(userId);

    if (
      verification.status !== VerificationStatus.not_started &&
      verification.status !== VerificationStatus.rejected
    ) {
      throw new ForbiddenException(
        'Cannot upload documents while verification is pending or already verified',
      );
    }

    const existing = verification.documents.find((d) => d.type === type);
    if (existing) {
      try { await this.s3.delete(existing.fileKey); } catch { /* old file may not exist */ }
      await this.prisma.verificationDocument.delete({ where: { id: existing.id } });
    }

    const key = `verification/${userId}/${type}`;
    await this.s3.upload(key, file.buffer, file.mimetype);

    const doc = await this.prisma.verificationDocument.create({
      data: {
        verificationId: verification.id,
        type,
        fileKey: key,
        fileName: file.originalname,
        fileSize: file.size,
      },
    });

    return {
      document: {
        id: doc.id,
        type: doc.type,
        fileName: doc.fileName,
        fileSize: doc.fileSize,
        uploadedAt: doc.uploadedAt.toISOString(),
        status: doc.status,
        url: await this.s3.getPresignedUrl(key),
      },
    };
  }

  async deleteDocument(userId: string, documentId: string) {
    const doc = await this.prisma.verificationDocument.findUnique({
      where: { id: documentId },
      include: { verification: { select: { userId: true } } },
    });

    if (!doc || doc.verification.userId !== userId) {
      throw new NotFoundException('Document not found');
    }

    if (doc.status !== 'uploaded') {
      throw new ForbiddenException(
        'Cannot delete a document that has already been reviewed',
      );
    }

    try { await this.s3.delete(doc.fileKey); } catch { /* file may not exist */ }

    await this.prisma.verificationDocument.delete({
      where: { id: documentId },
    });

    return { ok: true };
  }

  async submit(userId: string) {
    const verification = await this.findOrCreateVerification(userId);

    if (
      verification.status !== VerificationStatus.not_started &&
      verification.status !== VerificationStatus.rejected
    ) {
      throw new BadRequestException(
        `Cannot submit verification with status "${verification.status}"`,
      );
    }

    if (verification.documents.length === 0) {
      throw new BadRequestException(
        'Upload at least one document before submitting',
      );
    }

    await this.prisma.userVerification.update({
      where: { id: verification.id },
      data: {
        status: VerificationStatus.pending,
        submittedAt: new Date(),
        adminFeedback: null,
        reviewedAt: null,
        reviewedById: null,
      },
    });

    return this.getVerification(userId);
  }

  private async findOrCreateVerification(userId: string) {
    let verification = await this.prisma.userVerification.findUnique({
      where: { userId },
      include: { documents: { orderBy: { uploadedAt: 'desc' } } },
    });

    if (!verification) {
      verification = await this.prisma.userVerification.create({
        data: { userId },
        include: { documents: { orderBy: { uploadedAt: 'desc' } } },
      });
    }

    return verification;
  }
}
