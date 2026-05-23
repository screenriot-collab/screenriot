import { Injectable, BadRequestException } from '@nestjs/common';
import { DonationStatus } from '.prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import Stripe from 'stripe';
import { FilmsService } from '../films/films.service';
import { assertVerifiedParticipant } from '../auth/require-verified-participant';
import {
  STRIPE_CHECKOUT_PURPOSE_SCRIPT_CREDITS,
  STRIPE_CHECKOUT_PURPOSE_SUBMISSION_FEE,
} from '../films/constants';
import { isStripeCheckoutPaid, resolveStripeCheckoutSession } from './stripe-checkout.util';

export type DonationFulfillmentResult = {
  created: boolean;
  donationId: string;
  filmId: string;
  filmTitle: string;
  amount: number;
  userId: string;
  userEmail: string | null;
  stripePaymentId: string;
};

@Injectable()
export class DonationsService {
  private stripe: Stripe | null = null;
  private webhookSecret: string | null = null;

  constructor(
    private readonly prisma: PrismaService,
    private readonly films: FilmsService,
  ) {
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
    await assertVerifiedParticipant(this.prisma, userId);
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

    if (
      event.type === 'checkout.session.completed' ||
      event.type === 'checkout.session.async_payment_succeeded'
    ) {
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
    if (session.metadata?.purpose === STRIPE_CHECKOUT_PURPOSE_SUBMISSION_FEE) {
      await this.films.completeSubmissionFeeFromStripeSession(session);
      return;
    }
    if (session.metadata?.purpose === STRIPE_CHECKOUT_PURPOSE_SCRIPT_CREDITS) {
      await this.films.completeScriptCreditsFromStripeSession(session);
      return;
    }

    const filmId = session.metadata?.filmId;
    const userId = session.metadata?.userId;
    if (!filmId || !userId) {
      return;
    }

    await this.completeDonationFromStripeSession(session);
  }

  /**
   * Idempotent film investment / donation from Stripe Checkout (webhook or confirm).
   */
  async completeDonationFromStripeSession(
    session: Stripe.Checkout.Session,
  ): Promise<DonationFulfillmentResult> {
    const filmId = session.metadata?.filmId;
    const userId = session.metadata?.userId;
    if (!filmId || !userId) {
      throw new BadRequestException('Not a film investment checkout session');
    }
    if (session.metadata?.purpose) {
      throw new BadRequestException('This checkout is not a film investment');
    }
    if (!isStripeCheckoutPaid(session)) {
      throw new BadRequestException('Payment not completed in Stripe');
    }

    const amountCents = session.amount_total ?? 0;
    const amount = amountCents / 100;
    const stripePaymentId =
      typeof session.payment_intent === 'string'
        ? session.payment_intent
        : session.payment_intent?.id ?? session.id;

    const [existing, film, user] = await Promise.all([
      this.prisma.donation.findFirst({ where: { stripePaymentId } }),
      this.prisma.film.findUnique({
        where: { id: filmId },
        select: { id: true, title: true, currentAmount: true },
      }),
      this.prisma.user.findUnique({
        where: { id: userId },
        select: { email: true },
      }),
    ]);

    if (!film) {
      throw new BadRequestException('Film not found');
    }

    if (existing) {
      return {
        created: false,
        donationId: existing.id,
        filmId,
        filmTitle: film.title,
        amount: Number(existing.amount),
        userId,
        userEmail: user?.email ?? null,
        stripePaymentId,
      };
    }

    const donation = await this.prisma.$transaction(async (tx) => {
      const created = await tx.donation.create({
        data: {
          userId,
          filmId,
          amount,
          stripePaymentId,
          status: DonationStatus.completed,
        },
      });

      const current = Number(film.currentAmount) || 0;
      await tx.film.update({
        where: { id: filmId },
        data: { currentAmount: current + amount },
      });

      return created;
    });

    return {
      created: true,
      donationId: donation.id,
      filmId,
      filmTitle: film.title,
      amount,
      userId,
      userEmail: user?.email ?? null,
      stripePaymentId,
    };
  }

  async confirmDonationCheckout(userId: string, stripeId: string): Promise<DonationFulfillmentResult> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }
    const session = await resolveStripeCheckoutSession(this.stripe, stripeId);
    if (session.metadata?.userId !== userId) {
      throw new BadRequestException('Checkout session does not match your account');
    }
    return this.completeDonationFromStripeSession(session);
  }

  async fulfillDonationAsAdmin(stripeId: string): Promise<DonationFulfillmentResult> {
    if (!this.stripe) {
      throw new BadRequestException('Stripe is not configured');
    }
    const session = await resolveStripeCheckoutSession(this.stripe, stripeId);
    return this.completeDonationFromStripeSession(session);
  }
}
