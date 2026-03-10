'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { createCheckoutSession } from '@/lib/donations-api';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';
import { InvestGateModal } from './InvestGateModal';
import type { InvestmentTier } from '@/markup/film-detail';

const CARD_BASE =
  'block w-full rounded-lg border border-white/10 bg-white/[0.02] p-4 text-left transition-colors cursor-pointer hover:border-sky-500/40 hover:bg-white/[0.04] focus:outline-none focus:ring-2 focus:ring-teal-400 focus:ring-offset-2 focus:ring-offset-screenriot-bg';

interface FilmDetailInvestBlockProps {
  filmId: string;
  slug: string;
  tiers: InvestmentTier[];
}

export function FilmDetailInvestBlock({
  filmId,
  slug,
  tiers,
}: FilmDetailInvestBlockProps) {
  const { data: session, status } = useSession();
  const { isVerified, loading: verificationLoading } = useVerificationStatus();
  const [loadingTierId, setLoadingTierId] = useState<string | null>(null);
  const [gateVariant, setGateVariant] = useState<'signin' | 'verify' | null>(null);

  const isAuthenticated = status === 'authenticated' && session?.user;
  const accessToken = (session as { accessToken?: string })?.accessToken;
  const canInvest = isAuthenticated && isVerified && !verificationLoading;

  const handleTierClick = (tier: InvestmentTier) => {
    if (!isAuthenticated) {
      setGateVariant('signin');
      return;
    }
    if (!verificationLoading && !isVerified) {
      setGateVariant('verify');
      return;
    }
    void handleInvest(tier);
  };

  const handleInvest = async (tier: InvestmentTier) => {
    if (!isAuthenticated || !accessToken) return;
    const origin =
      typeof window !== 'undefined' ? window.location.origin : '';
    const successUrl = `${origin}/films/${slug}?donation=success`;
    const cancelUrl = `${origin}/films/${slug}?donation=cancelled`;
    setLoadingTierId(tier.id);
    try {
      const { url } = await createCheckoutSession(
        {
          filmId,
          amount: tier.amount,
          successUrl,
          cancelUrl,
        },
        accessToken,
      );
      if (url) window.location.href = url;
    } catch {
      setLoadingTierId(null);
    }
  };

  if (tiers.length === 0) return null;

  return (
    <>
      <ul className="mt-3 space-y-3" role="list">
        {tiers.map((tier) => (
          <li key={tier.id}>
            {canInvest ? (
              <button
                type="button"
                onClick={() => handleTierClick(tier)}
                disabled={loadingTierId !== null}
                className={`${CARD_BASE} disabled:opacity-50 disabled:cursor-not-allowed`}
                aria-label={`Invest $${tier.amount}: ${tier.name}`}
              >
                <p className="font-semibold text-white">
                  ${tier.amount.toLocaleString()} - {tier.name}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-400">
                  {tier.benefits.map((b) => (
                    <li key={b}>• {b}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-gray-500">
                  {tier.investorsCount} investors
                  {loadingTierId === tier.id && (
                    <span className="ml-2 text-teal-400">Redirecting…</span>
                  )}
                </p>
              </button>
            ) : (
              <button
                type="button"
                onClick={() => {
                  if (!isAuthenticated) setGateVariant('signin');
                  else if (!verificationLoading && !isVerified) setGateVariant('verify');
                }}
                className={CARD_BASE}
                aria-label={
                  !isAuthenticated
                    ? `Sign in to invest in ${tier.name} tier`
                    : `Verification required to invest in ${tier.name} tier`
                }
              >
                <p className="font-semibold text-white">
                  ${tier.amount.toLocaleString()} - {tier.name}
                </p>
                <ul className="mt-2 space-y-1 text-sm text-gray-400">
                  {tier.benefits.map((b) => (
                    <li key={b}>• {b}</li>
                  ))}
                </ul>
                <p className="mt-2 text-xs text-gray-500">
                  {tier.investorsCount} investors
                </p>
                <p className="mt-1 text-xs text-teal-400">
                  {!isAuthenticated
                    ? 'Sign in to invest'
                    : 'Verify in Profile → Security to invest'}
                </p>
              </button>
            )}
          </li>
        ))}
      </ul>
      {gateVariant && (
        <InvestGateModal
          variant={gateVariant}
          onClose={() => setGateVariant(null)}
          signInCallbackUrl={gateVariant === 'signin' ? `/films/${slug}` : undefined}
        />
      )}
    </>
  );
}
