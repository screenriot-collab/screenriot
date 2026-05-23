'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { createCheckoutSession } from '@/lib/donations-api';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import { InvestGateModal } from './InvestGateModal';

const MIN_AMOUNT = 100;

interface FilmDetailInvestCtaProps {
  filmId: string;
  slug: string;
}

const INVEST_BTN_CLASS =
  'flex w-full items-center justify-center rounded-lg bg-gradient-to-r from-screenriot-accent-blue to-blue-700 py-3 text-sm font-semibold text-white transition-opacity hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg';

export function FilmDetailInvestCta({ filmId, slug }: FilmDetailInvestCtaProps) {
  const mounted = useHasMounted();
  const { data: session, status } = useSession();
  const { isVerified, loading: verificationLoading } = useVerificationStatus();
  const [expanded, setExpanded] = useState(false);
  const [amount, setAmount] = useState<number>(MIN_AMOUNT);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [gateVariant, setGateVariant] = useState<'signin' | 'verify' | null>(null);

  const sessionReady = mounted && status !== 'loading' && !verificationLoading;
  const isAuthenticated = sessionReady && status === 'authenticated' && Boolean(session?.user);
  const accessToken = (session as { accessToken?: string })?.accessToken;
  const canInvest = isAuthenticated && isVerified;

  if (!sessionReady) {
    return (
      <button type="button" disabled className={`${INVEST_BTN_CLASS} opacity-50`} aria-busy="true">
        Invest in This Film
      </button>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isAuthenticated || !accessToken) return;
    const value = Number(amount);
    if (value < MIN_AMOUNT) {
      setError(`Minimum amount is $${MIN_AMOUNT}`);
      return;
    }
    setError(null);
    setLoading(true);
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const successUrl = `${origin}/films/${slug}?donation=success&session_id={CHECKOUT_SESSION_ID}`;
    const cancelUrl = `${origin}/films/${slug}?donation=cancelled`;
    try {
      const { url } = await createCheckoutSession(
        { filmId, amount: value, successUrl, cancelUrl },
        accessToken,
      );
      if (url) window.location.href = url;
    } catch {
      setError('Something went wrong. Try again.');
      setLoading(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <>
        <button
          type="button"
          onClick={() => setGateVariant('signin')}
          className={INVEST_BTN_CLASS}
          aria-label="Invest in this film (sign in required)"
        >
          Invest in This Film
        </button>
        {gateVariant === 'signin' && (
          <InvestGateModal
            variant="signin"
            onClose={() => setGateVariant(null)}
            signInCallbackUrl={`/films/${slug}`}
          />
        )}
      </>
    );
  }

  if (!verificationLoading && !isVerified) {
    return (
      <>
        <button
          type="button"
          onClick={() => setGateVariant('verify')}
          className={INVEST_BTN_CLASS}
          aria-label="Invest in this film (verification required)"
        >
          Invest in This Film
        </button>
        {gateVariant === 'verify' && (
          <InvestGateModal
            variant="verify"
            onClose={() => setGateVariant(null)}
          />
        )}
      </>
    );
  }

  if (!expanded) {
    return (
      <button
        type="button"
        onClick={() => setExpanded(true)}
        className={INVEST_BTN_CLASS}
        aria-label="Choose your investment amount (min $100)"
      >
        Invest in This Film
      </button>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-3">
      <label htmlFor="invest-amount" className="block text-sm font-medium text-gray-300">
        Amount (USD, min $100)
      </label>
      <input
        id="invest-amount"
        type="number"
        min={MIN_AMOUNT}
        step={1}
        value={amount}
        onChange={(e) => setAmount(Number(e.target.value) || MIN_AMOUNT)}
        className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-screenriot-accent-blue focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue"
        aria-describedby="invest-amount-hint"
        disabled={loading}
      />
      <p id="invest-amount-hint" className="text-xs text-gray-500">
        Minimum $100. Payment is held in Stripe escrow until the campaign completes. Voting is free and separate.
      </p>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <div className="flex gap-2">
        <button
          type="submit"
          disabled={loading}
          className="flex-1 rounded-lg bg-gradient-to-r from-screenriot-accent-blue to-blue-700 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-95 disabled:opacity-50 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
        >
          {loading ? 'Redirecting…' : 'Proceed to checkout'}
        </button>
        <button
          type="button"
          onClick={() => { setExpanded(false); setError(null); }}
          className="rounded-lg border border-white/20 px-3 py-2.5 text-sm font-medium text-gray-300 hover:bg-white/5 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
          aria-label="Cancel"
        >
          Cancel
        </button>
      </div>
    </form>
  );
}
