import { useCallback, useEffect, useState } from 'react';
import { fulfillSubmissionFeeFromSession, getSubmissionFeePayments } from '@/lib/api';
import type { SubmissionFeePaymentRow } from '@/types/submission-fees';

export function useSubmissionFeePayments() {
  const [payments, setPayments] = useState<SubmissionFeePaymentRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');

  const limit = 30;

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getSubmissionFeePayments({
        page,
        limit,
        ...(search ? { search } : {}),
      });
      setPayments(data.payments);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setPayments([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const totalPages = Math.ceil(total / limit) || 1;

  async function fulfillSession(sessionId: string) {
    const result = await fulfillSubmissionFeeFromSession(sessionId);
    await fetchList();
    return result;
  }

  function applySearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  return {
    payments,
    total,
    page,
    totalPages,
    loading,
    error,
    searchInput,
    setSearchInput,
    applySearch,
    setPage,
    fulfillSession,
    refetch: fetchList,
  };
}
