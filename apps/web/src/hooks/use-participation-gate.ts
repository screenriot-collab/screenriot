'use client';

import { useCallback, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useHasMounted } from '@/hooks/use-has-mounted';
import { useVerificationStatus } from '@/hooks/useVerificationStatus';

export type ParticipationGateVariant = 'signin' | 'verify';

export function useParticipationGate(signInCallbackUrl?: string) {
  const mounted = useHasMounted();
  const { data: session, status } = useSession();
  const { isVerified, loading: verificationLoading } = useVerificationStatus();
  const [gateVariant, setGateVariant] = useState<ParticipationGateVariant | null>(null);

  const sessionReady = mounted && status !== 'loading' && !verificationLoading;
  const isAuthenticated = sessionReady && status === 'authenticated' && Boolean(session?.user);
  const canParticipate = isAuthenticated && isVerified;
  const accessToken = (session as { accessToken?: string } | undefined)?.accessToken;

  const requireParticipation = useCallback((): boolean => {
    if (!sessionReady) return false;
    if (!isAuthenticated) {
      setGateVariant('signin');
      return false;
    }
    if (!isVerified) {
      setGateVariant('verify');
      return false;
    }
    return true;
  }, [sessionReady, isAuthenticated, isVerified]);

  const closeGate = useCallback(() => setGateVariant(null), []);

  return {
    sessionReady,
    canParticipate,
    accessToken,
    gateVariant,
    closeGate,
    requireParticipation,
    signInCallbackUrl,
  };
}
