'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { getVerification } from '@/lib/profile-api';
import type { VerificationData } from '@/markup/profile';

export function useVerificationStatus(): {
  verification: VerificationData | null;
  isVerified: boolean;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const { data: session, status } = useSession();
  const [verification, setVerification] = useState<VerificationData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accessToken = (session as { accessToken?: string })?.accessToken;

  const fetchVerification = useCallback(async () => {
    if (!accessToken) {
      setVerification(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getVerification(accessToken);
      setVerification(data);
    } catch {
      setError('Failed to load verification status');
      setVerification(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === 'loading') return;
    void fetchVerification();
  }, [status, fetchVerification]);

  const isVerified = verification?.status === 'verified';

  return {
    verification: verification ?? null,
    isVerified,
    loading,
    error,
    refetch: fetchVerification,
  };
}
