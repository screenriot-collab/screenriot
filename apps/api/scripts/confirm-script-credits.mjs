/**
 * Apply script credits from a Stripe Checkout session (e.g. webhook missed locally).
 * Usage: node apps/api/scripts/confirm-script-credits.mjs <checkout_session_id>
 */
import { config } from 'dotenv';
import { resolve } from 'path';
import Stripe from 'stripe';
import { PrismaClient } from '@prisma/client';

config({ path: resolve(process.cwd(), '../../.env') });
config({ path: resolve(process.cwd(), '.env') });

const SCRIPT_CREDITS_PACK_AMOUNT = 10;
const PURPOSE = 'script_credits';

const stripeId = process.argv[2];
if (!stripeId) {
  console.error('Usage: node apps/api/scripts/confirm-script-credits.mjs <pi_... or cs_...>');
  process.exit(1);
}

const stripeKey = process.env.STRIPE_SECRET_KEY;
if (!stripeKey) {
  console.error('STRIPE_SECRET_KEY is not set');
  process.exit(1);
}

const stripe = new Stripe(stripeKey);
const prisma = new PrismaClient();

function isPaid(session) {
  if (session.payment_status === 'paid') return true;
  return session.status === 'complete' && (session.amount_total ?? 0) > 0;
}

async function resolveSession(id) {
  const trimmed = id.trim();
  if (trimmed.startsWith('cs_')) {
    return stripe.checkout.sessions.retrieve(trimmed);
  }
  if (trimmed.startsWith('pi_')) {
    const listed = await stripe.checkout.sessions.list({ payment_intent: trimmed, limit: 1 });
    if (!listed.data[0]) {
      throw new Error(`No Checkout session for Payment Intent ${trimmed}`);
    }
    return listed.data[0];
  }
  throw new Error('Expected pi_... or cs_...');
}

try {
  const session = await resolveSession(stripeId);
  if (session.metadata?.purpose !== PURPOSE) {
    throw new Error(`Not a script credits session (purpose=${session.metadata?.purpose ?? 'none'})`);
  }
  const userId = session.metadata?.userId;
  const creditsRaw = session.metadata?.credits;
  const credits = creditsRaw ? Number.parseInt(creditsRaw, 10) : SCRIPT_CREDITS_PACK_AMOUNT;
  if (!userId || !Number.isFinite(credits) || credits <= 0) {
    throw new Error('Invalid session metadata');
  }
  if (!isPaid(session)) {
    throw new Error(`Payment not completed (status=${session.status}, payment_status=${session.payment_status})`);
  }

  const existing = await prisma.scriptCreditPurchase.findUnique({
    where: { stripeSessionId: session.id },
  });
  if (existing) {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { email: true, scriptCredits: true },
    });
    console.log(`Already fulfilled for ${user?.email ?? userId}. Balance: ${user?.scriptCredits ?? 0}`);
    process.exit(0);
  }

  await prisma.$transaction(async (tx) => {
    await tx.scriptCreditPurchase.create({
      data: { userId, stripeSessionId: session.id, credits },
    });
    await tx.user.update({
      where: { id: userId },
      data: { scriptCredits: { increment: credits } },
    });
  });

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, scriptCredits: true },
  });
  console.log(`Added ${credits} credits to ${user?.email ?? userId}. New balance: ${user?.scriptCredits ?? 0}`);
} catch (e) {
  console.error(e instanceof Error ? e.message : e);
  process.exit(1);
} finally {
  await prisma.$disconnect();
}
