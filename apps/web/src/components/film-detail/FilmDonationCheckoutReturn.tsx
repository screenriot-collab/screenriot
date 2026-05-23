'use client';

import { useEffect, useRef } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { confirmDonationCheckout } from '@/lib/donations-api';

interface FilmDonationCheckoutReturnProps {
  filmSlug: string;
}

export function FilmDonationCheckoutReturn({ filmSlug }: FilmDonationCheckoutReturnProps) {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { data: session, status } = useSession();
  const startedRef = useRef(false);

  useEffect(() => {
    if (!searchParams || searchParams.get('donation') !== 'success') return;
    const sessionId = searchParams.get('session_id');
    if (!sessionId || status !== 'authenticated' || startedRef.current) return;

    const accessToken = (session as { accessToken?: string } | undefined)?.accessToken;
    if (!accessToken) return;

    startedRef.current = true;

    void (async () => {
      try {
        await confirmDonationCheckout(sessionId, accessToken);
        window.dispatchEvent(new CustomEvent('screenriot:donation-confirmed'));
      } catch {
        // Dashboard may still be empty; admin can fulfill manually
      } finally {
        router.replace(`/films/${filmSlug}`, { scroll: false });
      }
    })();
  }, [searchParams, status, session, filmSlug, router]);

  return null;
}
