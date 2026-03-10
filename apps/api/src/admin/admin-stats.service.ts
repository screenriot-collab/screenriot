import { Injectable } from '@nestjs/common';
import { UserRole } from '.prisma/client';
import { PrismaService } from '../prisma/prisma.service';

const SITE_ROLES: UserRole[] = [UserRole.fan, UserRole.filmmaker];

function toNumber(value: unknown): number {
  if (value == null) return 0;
  if (typeof value === 'object' && 'toNumber' in value && typeof (value as { toNumber: () => number }).toNumber === 'function') {
    return (value as { toNumber: () => number }).toNumber();
  }
  return Number(value);
}

export interface DashboardStatsDto {
  users: {
    total: number;
    fan: number;
    filmmaker: number;
    emailVerified: number;
  };
  films: {
    byStatus: Record<string, number>;
    publishedCount: number;
  };
  donations: {
    totalAmount: number;
    count: number;
    completedCount: number;
  };
  verifications: {
    byStatus: Record<string, number>;
    pendingCount: number;
  };
  payouts: {
    byStatus: Record<string, number>;
    pendingSum: number;
  };
  operational: {
    filmsPendingReview: number;
    verificationsPending: number;
  };
}

@Injectable()
export class AdminStatsService {
  constructor(private readonly prisma: PrismaService) {}

  async getStats(): Promise<DashboardStatsDto> {
    const [userCounts, userEmailVerified, filmsByStatus, filmsPublished, donationAgg, verificationCounts, payoutAgg, filmsPendingReview] =
      await Promise.all([
        this.prisma.user.groupBy({
          by: ['role'],
          where: { role: { in: SITE_ROLES } },
          _count: { id: true },
        }),
        this.prisma.user.count({
          where: {
            role: { in: SITE_ROLES },
            emailVerifiedAt: { not: null },
          },
        }),
        this.prisma.film.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        this.prisma.film.count({ where: { pagePublished: true } }),
        Promise.all([
          this.prisma.donation.aggregate({
            _sum: { amount: true },
            where: { status: 'completed' },
          }),
          this.prisma.donation.count(),
          this.prisma.donation.count({ where: { status: 'completed' } }),
        ]).then(([agg, total, completed]) => ({ agg, total, completed })),
        this.prisma.userVerification.groupBy({
          by: ['status'],
          _count: { id: true },
        }),
        this.prisma.payout.groupBy({
          by: ['status'],
          _sum: { amount: true },
          _count: { id: true },
        }),
        this.prisma.film.count({
          where: {
            OR: [
              { status: 'pending_approval' },
              { reviewStatus: { not: null } },
            ],
          },
        }),
      ]);

    const byRole: Record<string, number> = { fan: 0, filmmaker: 0 };
    userCounts.forEach((r) => {
      byRole[r.role] = r._count.id;
    });
    const usersTotal = (byRole.fan ?? 0) + (byRole.filmmaker ?? 0);

    const filmsByStatusMap: Record<string, number> = {};
    filmsByStatus.forEach((f) => {
      filmsByStatusMap[f.status] = f._count.id;
    });

    const verificationsByStatus: Record<string, number> = {};
    let verificationsPendingCount = 0;
    verificationCounts.forEach((v) => {
      verificationsByStatus[v.status] = v._count.id;
      if (v.status === 'pending') verificationsPendingCount = v._count.id;
    });

    const payoutsByStatus: Record<string, number> = {};
    let pendingSum = 0;
    payoutAgg.forEach((p) => {
      payoutsByStatus[p.status] = p._count?.id ?? 0;
      const sum = p._sum?.amount;
      const num = toNumber(sum);
      if (p.status === 'pending') pendingSum = num;
    });

    const { agg: donationAggResult, total: donationsTotalCount, completed: donationsCompletedCount } = donationAgg as {
      agg: { _sum: { amount: unknown } };
      total: number;
      completed: number;
    };
    const totalAmount = toNumber(donationAggResult._sum?.amount);

    return {
      users: {
        total: usersTotal,
        fan: byRole.fan ?? 0,
        filmmaker: byRole.filmmaker ?? 0,
        emailVerified: userEmailVerified,
      },
      films: {
        byStatus: filmsByStatusMap,
        publishedCount: filmsPublished,
      },
      donations: {
        totalAmount: Math.round(totalAmount * 100) / 100,
        count: donationsTotalCount,
        completedCount: donationsCompletedCount,
      },
      verifications: {
        byStatus: verificationsByStatus,
        pendingCount: verificationsPendingCount,
      },
      payouts: {
        byStatus: payoutsByStatus,
        pendingSum: Math.round(pendingSum * 100) / 100,
      },
      operational: {
        filmsPendingReview,
        verificationsPending: verificationsPendingCount,
      },
    };
  }
}
