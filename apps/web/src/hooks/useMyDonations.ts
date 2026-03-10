'use client';

import { useSession } from 'next-auth/react';
import { useEffect, useState, useCallback } from 'react';
import { getMyDonations, type MyDonationItem } from '@/lib/donations-api';

export function useMyDonations(): {
  donations: MyDonationItem[];
  totalInvested: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
} {
  const { data: session, status } = useSession();
  const [donations, setDonations] = useState<MyDonationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const accessToken = (session as { accessToken?: string })?.accessToken;

  const fetchDonations = useCallback(async () => {
    if (!accessToken) {
      setDonations([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const data = await getMyDonations(accessToken);
      setDonations(data);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load donations');
      setDonations([]);
    } finally {
      setLoading(false);
    }
  }, [accessToken]);

  useEffect(() => {
    if (status === 'loading') return;
    void fetchDonations();
  }, [status, fetchDonations]);

  const totalInvested = donations.reduce((sum, d) => sum + d.amount, 0);

  return {
    donations,
    totalInvested,
    loading,
    error,
    refetch: fetchDonations,
  };
}
