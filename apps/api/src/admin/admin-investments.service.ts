import { Injectable } from '@nestjs/common';
import { FilmStatus } from '.prisma/client';
import { PrismaService } from '../prisma/prisma.service';

export interface FilmWithInvestmentsDto {
  filmId: string;
  title: string;
  slug: string;
  status: string;
  totalRaised: number;
  investorsCount: number;
  lastDonationAt: string | null;
}

export interface DonationRowDto {
  id: string;
  userId: string;
  amount: number;
  status: string;
  createdAt: string;
  userEmail?: string;
}

@Injectable()
export class AdminInvestmentsService {
  constructor(private readonly prisma: PrismaService) {}

  async getFilmsWithInvestments(params?: {
    status?: string;
    page?: number;
    limit?: number;
  }): Promise<{ films: FilmWithInvestmentsDto[]; total: number }> {
    const page = Math.max(1, params?.page ?? 1);
    const limit = Math.min(100, Math.max(1, params?.limit ?? 20));
    const skip = (page - 1) * limit;

    const statusFilter =
      params?.status && Object.values(FilmStatus).includes(params.status as FilmStatus)
        ? { status: params.status as FilmStatus }
        : {};

    const where = {
      ...statusFilter,
      donations: { some: {} },
    };

    const [filmsWithDonations, total] = await Promise.all([
      this.prisma.film.findMany({
        where,
        include: {
          _count: { select: { donations: true } },
          donations: {
            select: {
              amount: true,
              createdAt: true,
            },
          },
        },
        take: 2000,
      }),
      this.prisma.film.count({ where }),
    ]);

    type FilmWithDonations = (typeof filmsWithDonations)[number];

    const allFilms: FilmWithInvestmentsDto[] = filmsWithDonations
      .map((f: FilmWithDonations) => {
        const amounts = f.donations.map((d) => Number(d.amount));
        const totalRaised = amounts.reduce((s: number, a: number) => s + a, 0);
        const lastDonation = f.donations.length
          ? f.donations.reduce((latest, d) =>
              d.createdAt > latest.createdAt ? d : latest,
            )
          : null;
        return {
          filmId: f.id,
          title: f.title,
          slug: f.slug,
          status: f.status,
          totalRaised,
          investorsCount: f._count.donations,
          lastDonationAt: lastDonation?.createdAt.toISOString() ?? null,
        };
      })
      .sort((a, b) => b.totalRaised - a.totalRaised);

    const films = allFilms.slice(skip, skip + limit);
    return { films, total };
  }

  async getDonationsByFilmId(filmId: string): Promise<DonationRowDto[]> {
    const donations = await this.prisma.donation.findMany({
      where: { filmId },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true } },
      },
    });
    return donations.map((d) => ({
      id: d.id,
      userId: d.userId,
      amount: Number(d.amount),
      status: d.status,
      createdAt: d.createdAt.toISOString(),
      userEmail: d.user.email,
    }));
  }
}
