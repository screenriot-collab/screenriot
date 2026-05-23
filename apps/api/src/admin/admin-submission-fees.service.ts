import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilmsService } from '../films/films.service';
export interface SubmissionFeePaymentRowDto {
  id: string;
  filmId: string;
  filmTitle: string;
  userId: string;
  userEmail: string;
  stripeSessionId: string;
  createdAt: string;
  amountUsd: number;
}

@Injectable()
export class AdminSubmissionFeesService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly films: FilmsService,
  ) {}

  async listPayments(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ payments: SubmissionFeePaymentRowDto[]; total: number }> {
    const page = Math.max(1, params?.page ?? 1);
    const limit = Math.min(100, Math.max(1, params?.limit ?? 30));
    const skip = (page - 1) * limit;
    const search = params?.search?.trim();

    const where = search
      ? {
          user: {
            email: { contains: search, mode: 'insensitive' as const },
          },
        }
      : {};

    const [rows, total] = await this.prisma.$transaction([
      this.prisma.submissionFeePayment.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { email: true } },
          film: { select: { title: true } },
        },
      }),
      this.prisma.submissionFeePayment.count({ where }),
    ]);

    return {
      payments: rows.map((row) => ({
        id: row.id,
        filmId: row.filmId,
        filmTitle: row.film.title,
        userId: row.userId,
        userEmail: row.user.email,
        stripeSessionId: row.stripeSessionId,
        createdAt: row.createdAt.toISOString(),
        amountUsd: Number(row.amountUsd),
      })),
      total,
    };
  }

  async fulfillFromStripeSession(stripeId: string) {
    return this.films.fulfillSubmissionFeeFromStripeSessionAsAdmin(stripeId);
  }
}
