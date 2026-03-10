import { useState, useEffect, useCallback } from 'react';
import { listContributions, approveContribution, rejectContribution } from '@/lib/api';
import type { AdminContribution } from '@/types/contributions';

export function useContributions() {
  const [contributions, setContributions] = useState<AdminContribution[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [status, setStatus] = useState<string>('pending');
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await listContributions({ page, limit: 20, status, search: search.trim() });
      setContributions(data.contributions);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : 'Failed to load contributions');
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleApprove = async (id: string) => {
    try {
      await approveContribution(id);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to approve contribution');
    }
  };

  const handleReject = async (id: string, adminComment: string) => {
    try {
      await rejectContribution(id, adminComment);
      await loadData();
    } catch (err: unknown) {
      alert(err instanceof Error ? err.message : 'Failed to reject contribution');
    }
  };

  return {
    contributions,
    total,
    page,
    totalPages,
    loading,
    error,
    status,
    search,
    setPage,
    setStatus,
    setSearch,
    handleApprove,
    handleReject,
    reload: loadData,
  };
}
