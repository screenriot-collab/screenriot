import { BadRequestException, Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { FilmsService } from '../films/films.service';
import { SCRIPT_CREDITS_PACK_PRICE_CENTS } from '../films/constants';

export interface ScriptCreditPurchaseRowDto {
  id: string;
  userId: string;
  userEmail: string;
  credits: number;
  stripeSessionId: string;
  createdAt: string;
  amountUsd: number;
}

@Injectable()
export class AdminScriptCreditsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly films: FilmsService,
  ) {}

  async listPurchases(params?: {
    search?: string;
    page?: number;
    limit?: number;
  }): Promise<{ purchases: ScriptCreditPurchaseRowDto[]; total: number }> {
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
      this.prisma.scriptCreditPurchase.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          user: { select: { email: true } },
        },
      }),
      this.prisma.scriptCreditPurchase.count({ where }),
    ]);

    const amountUsd = SCRIPT_CREDITS_PACK_PRICE_CENTS / 100;

    return {
      purchases: rows.map((row) => ({
        id: row.id,
        userId: row.userId,
        userEmail: row.user.email,
        credits: row.credits,
        stripeSessionId: row.stripeSessionId,
        createdAt: row.createdAt.toISOString(),
        amountUsd,
      })),
      total,
    };
  }

  async fulfillFromStripeSession(stripeId: string) {
    return this.films.fulfillScriptCreditsFromStripeSessionAsAdmin(stripeId);
  }
}
