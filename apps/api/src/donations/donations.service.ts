import { Injectable, BadRequestException } from '@nestjs/common';
import { DonationStatus, VerificationStatus } from '.prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';

@Injectable()
export class DonationsService {
  private stripe: Stripe | null = null;
  private webhookSecret: string | null = null;

  constructor(private readonly prisma: PrismaService) {
    const secret = process.env.STRIPE_SECRET_KEY;
    if (secret) {
      this.stripe = new Stripe(secret);
    }
    this.webhookSecret = process.env.STRIPE_WEBHOOK_SECRET ?? null;
  }

  /**
   * Create Stripe Checkout Session for a film donation. Returns URL to redirect the user.
   */
  async createCheckoutSession(
    userId: string,
    filmId: string,
    amount: number,
    successUrl: string,
    cancelUrl: string,
  ): Promise<{ url: string }> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      select: { verification: { select: { status: true } } },
    });
    if (!user?.verification || user.verification.status !== VerificationStatus.verified) {
      throw new BadRequestException(
        'Identity verification required. Complete verification in Profile → Security to invest.',
      );
    }
    const film = await this.prisma.film.findUnique({
      where: { id: filmId },
      select: { id: true, title: true },
    });
    if (!film) {
      throw new BadRequestException('Film not found');
    }
    const amountCents = Math.round(amount * 100);
    if (amountCents < 10000) {
      throw new BadRequestException('Minimum amount is 100 USD');
    }
    const session = await this.stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: [
        {
          price_data: {
            currency: 'usd',
            unit_amount: amountCents,
            product_data: {
              name: `Donation: ${film.title}`,
              description: 'Film investment',
            },
          },
          quantity: 1,
        },
      ],
      metadata: { filmId, userId },
      success_url: successUrl,
      cancel_url: cancelUrl,
    });
    if (!session.url) {
      throw new BadRequestException('Failed to create checkout session');
    }
    return { url: session.url };
  }

  /**
   * Handle Stripe webhook. Raw body and stripe-signature header required.
   * Events: checkout.session.completed — create Donation, update Film.currentAmount.
   */
  async handleWebhook(rawBody: Buffer, signature: string): Promise<void> {
    if (!this.webhookSecret) {
      throw new BadRequestException('Webhook secret not configured');
    }
    if (!this.stripe) {
      throw new BadRequestException('Stripe not configured');
    }

    let event: Stripe.Event;
    try {
      event = this.stripe.webhooks.constructEvent(rawBody, signature, this.webhookSecret);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Invalid signature';
      throw new BadRequestException(`Webhook signature verification failed: ${message}`);
    }

    if (event.type === 'checkout.session.completed') {
      const session = event.data.object as Stripe.Checkout.Session;
      await this.handleCheckoutCompleted(session);
    }
  }

  /**
   * List donations for the current user (for Investor Dashboard and Tracked Films).
   */
  async getMine(userId: string) {
    const donations = await this.prisma.donation.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      include: {
        film: {
          select: { id: true, title: true, slug: true, status: true },
        },
      },
    });
    return donations.map((d) => ({
      id: d.id,
      filmId: d.filmId,
      filmTitle: d.film.title,
      filmSlug: d.film.slug,
      filmStatus: d.film.status,
      amount: Number(d.amount),
      status: d.status,
      createdAt: d.createdAt.toISOString(),
    }));
  }

  private async handleCheckoutCompleted(session: Stripe.Checkout.Session): Promise<void> {
    const filmId = session.metadata?.filmId;
    const userId = session.metadata?.userId;
    if (!filmId || !userId) {
      return;
    }

    const amountCents = session.amount_total ?? 0;
    const amount = amountCents / 100;
    const stripePaymentId = (session.payment_intent as string) ?? session.id;

    const existing = await this.prisma.donation.findFirst({
      where: { stripePaymentId },
    });
    if (existing) {
      return;
    }

    await this.prisma.$transaction(async (tx) => {
      await tx.donation.create({
        data: {
          userId,
          filmId,
          amount,
          stripePaymentId,
          status: DonationStatus.completed,
        },
      });

      const film = await tx.film.findUnique({
        where: { id: filmId },
        select: { currentAmount: true },
      });
      if (film) {
        const current = Number(film.currentAmount) || 0;
        await tx.film.update({
          where: { id: filmId },
          data: { currentAmount: current + amount },
        });
      }
    });
  }
}
