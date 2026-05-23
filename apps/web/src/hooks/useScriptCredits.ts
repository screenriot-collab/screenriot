'use client';

import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { getMyScriptCredits } from '@/lib/script-credits-api';

export function useScriptCredits() {
  const { data: session, status } = useSession();
  const [scriptCredits, setScriptCredits] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accessToken = (session as { accessToken?: string } | undefined)?.accessToken;

  const refetch = useCallback(async () => {
    if (!accessToken) {
      setScriptCredits(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const balance = await getMyScriptCredits(accessToken);
      setScriptCredits(balance);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load script credits');
      setScriptCredits(null);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === 'loading') return;
    void refetch();
  }, [status, refetch]);

  return { scriptCredits, loading, error, refetch };
}
