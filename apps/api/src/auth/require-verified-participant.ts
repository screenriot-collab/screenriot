import { BadRequestException } from '@nestjs/common';
import { VerificationStatus } from '.prisma/client';
import type { PrismaService } from '../prisma/prisma.service';

export const VERIFICATION_REQUIRED_MESSAGE =
  'Identity verification required. Complete verification in Profile → Security to participate.';

export async function assertVerifiedParticipant(
  prisma: PrismaService,
  userId: string,
): Promise<void> {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { verification: { select: { status: true } } },
  });
  if (!user?.verification || user.verification.status !== VerificationStatus.verified) {
    throw new BadRequestException(VERIFICATION_REQUIRED_MESSAGE);
  }
}
