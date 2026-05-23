import { BadRequestException } from '@nestjs/common';
import Stripe from 'stripe';

export function isStripeCheckoutPaid(session: Stripe.Checkout.Session): boolean {
  if (session.payment_status === 'paid') return true;
  return session.status === 'complete' && (session.amount_total ?? 0) > 0;
}

export async function resolveStripeCheckoutSession(
  stripe: Stripe,
  stripeId: string,
): Promise<Stripe.Checkout.Session> {
  const trimmed = stripeId.trim();
  if (trimmed.startsWith('cs_')) {
    return stripe.checkout.sessions.retrieve(trimmed);
  }
  if (trimmed.startsWith('pi_')) {
    const listed = await stripe.checkout.sessions.list({
      payment_intent: trimmed,
      limit: 1,
    });
    const session = listed.data[0];
    if (!session) {
      throw new BadRequestException(
        'No Checkout session found for this Payment Intent. Open the payment in Stripe or use the Checkout session id (cs_...).',
      );
    }
    return session;
  }
  throw new BadRequestException(
    'Paste a Stripe Checkout session id (cs_...) or Payment Intent id (pi_...) from Payments.',
  );
}
