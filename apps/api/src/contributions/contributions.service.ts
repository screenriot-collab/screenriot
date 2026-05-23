import { Injectable, NotFoundException, BadRequestException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { MailService } from '../mail/mail.service';
import { CreateContributionDto } from './dto/create-contribution.dto';
import { ContributionStatus } from '.prisma/client';

@Injectable()
export class ContributionsService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly mailService: MailService,
  ) {}

  async create(userId: string, dto: CreateContributionDto) {
    // Check if film exists and belongs to user
    const film = await this.prisma.film.findUnique({
      where: { id: dto.filmId },
      select: {
        id: true,
        title: true,
        filmmakerId: true,
        status: true,
        pagePublished: true,
      },
    });

    if (!film) {
      throw new NotFoundException('Film not found');
    }

    if (film.filmmakerId !== userId) {
      throw new BadRequestException('You do not own this film');
    }

    const allowedStatuses = ['approved', 'fundraising', 'funded', 'closed'] as const;
    if (!allowedStatuses.includes(film.status as (typeof allowedStatuses)[number])) {
      throw new BadRequestException(
        'Change requests are only allowed for approved or published films',
      );
    }
    if (!film.pagePublished) {
      throw new BadRequestException('Film page must be published before proposing changes');
    }

    const number = this.generateNumber();

    const contribution = await this.prisma.filmContribution.create({
      data: {
        number,
        filmId: dto.filmId,
        userId,
        changes: dto.changes,
        comment: dto.comment,
        status: ContributionStatus.pending,
      },
    });

    // Send email notification to the user
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, firstName: true },
    });

    if (user?.email) {
      await this.mailService.sendMail({
        to: user.email,
        subject: `Change Request Submitted: ${film.title}`,
        html: `
          <p>Hi ${user.firstName || 'Filmmaker'},</p>
          <p>Your change request (<strong>#${number}</strong>) for the film <strong>${film.title}</strong> has been submitted successfully and is now pending review.</p>
          <p>You can track the status of this request in your dashboard.</p>
          <br/>
          <p>Thanks,<br/>The Screen Riot Team</p>
        `,
      });
    }

    return { contribution };
  }

  async getMine(userId: string) {
    const contributions = await this.prisma.filmContribution.findMany({
      where: { userId },
      include: {
        film: {
          select: { id: true, title: true, slug: true },
        },
      },
      orderBy: { createdAt: 'desc' },
    });

    return { contributions };
  }

  private generateNumber(): string {
    const now = new Date();
    const datePart = now.toISOString().slice(0, 10).replace(/-/g, ''); // YYYYMMDD
    const randomPart = Math.floor(100000 + Math.random() * 900000); // 6 digits
    return `${datePart}-${randomPart}`;
  }
}
