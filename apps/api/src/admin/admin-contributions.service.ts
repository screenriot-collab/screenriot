import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { Prisma, ContributionStatus } from '.prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { applyContributionPatches } from '../contributions/contribution-patches.util';

@Injectable()
export class AdminContributionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async findAll(page = 1, limit = 20, status?: string, search?: string) {
    const where: Prisma.FilmContributionWhereInput = {};
    if (status) {
      where.status = status as ContributionStatus;
    }
    if (search) {
      where.OR = [
        { number: { contains: search, mode: 'insensitive' } },
        { film: { title: { contains: search, mode: 'insensitive' } } },
        { user: { email: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [contributions, total] = await Promise.all([
      this.prisma.filmContribution.findMany({
        where,
        include: {
          film: { select: { id: true, title: true } },
          user: { select: { id: true, email: true, firstName: true, lastName: true, username: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      this.prisma.filmContribution.count({ where }),
    ]);

    return {
      contributions,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async getById(id: string) {
    const contribution = await this.prisma.filmContribution.findUnique({
      where: { id },
      include: {
        film: {
          select: {
            id: true,
            title: true,
            synopsis: true,
            logline: true,
            genre: true,
            directorName: true,
            pageContent: true,
          },
        },
        user: { select: { id: true, email: true, firstName: true, lastName: true, username: true } },
      },
    });
    if (!contribution) throw new NotFoundException('Contribution not found');
    return { contribution };
  }

  async approve(id: string) {
    const contribution = await this.prisma.filmContribution.findUnique({
      where: { id },
      include: {
        film: {
          select: {
            id: true,
            title: true,
            synopsis: true,
            logline: true,
            genre: true,
            directorName: true,
            pageContent: true,
          },
        },
        user: { select: { id: true, email: true, firstName: true } },
      },
    });

    if (!contribution) throw new NotFoundException('Contribution not found');
    if (contribution.status !== ContributionStatus.pending) {
      throw new BadRequestException('Only pending contributions can be approved');
    }

    const { filmColumns, pageContent } = applyContributionPatches(
      contribution.film,
      contribution.changes,
    );

    await this.prisma.$transaction(async (tx) => {
      await tx.filmContribution.update({
        where: { id },
        data: {
          status: ContributionStatus.approved,
          processedAt: new Date(),
        },
      });

      await tx.film.update({
        where: { id: contribution.filmId },
        data: {
          ...filmColumns,
          pageContent: pageContent as Prisma.InputJsonValue,
        },
      });
    });

    if (contribution.user?.email) {
      await this.mailService.sendMail({
        to: contribution.user.email,
        subject: `Change Request Approved: ${contribution.film.title}`,
        html: `
          <p>Hi ${contribution.user.firstName || 'Filmmaker'},</p>
          <p>Great news! Your change request (<strong>#${contribution.number}</strong>) for the film <strong>${contribution.film.title}</strong> has been approved and applied to the film page.</p>
          <br/>
          <p>Thanks,<br/>The Screen Riot Team</p>
        `,
      });
    }

    return { ok: true };
  }

  async reject(id: string, adminComment: string) {
    const contribution = await this.prisma.filmContribution.findUnique({
      where: { id },
      include: {
        film: { select: { id: true, title: true } },
        user: { select: { id: true, email: true, firstName: true } },
      },
    });

    if (!contribution) throw new NotFoundException('Contribution not found');
    if (contribution.status !== ContributionStatus.pending) {
      throw new BadRequestException('Only pending contributions can be rejected');
    }

    await this.prisma.filmContribution.update({
      where: { id },
      data: {
        status: ContributionStatus.rejected,
        adminComment,
        processedAt: new Date(),
      },
    });

    if (contribution.user?.email) {
      await this.mailService.sendMail({
        to: contribution.user.email,
        subject: `Change Request Rejected: ${contribution.film.title}`,
        html: `
          <p>Hi ${contribution.user.firstName || 'Filmmaker'},</p>
          <p>Your change request (<strong>#${contribution.number}</strong>) for the film <strong>${contribution.film.title}</strong> was reviewed but could not be approved at this time.</p>
          <p><strong>Reason:</strong> ${adminComment}</p>
          <br/>
          <p>Thanks,<br/>The Screen Riot Team</p>
        `,
      });
    }

    return { ok: true };
  }
}
