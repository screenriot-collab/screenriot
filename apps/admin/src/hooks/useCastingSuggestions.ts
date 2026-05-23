import { useCallback, useEffect, useState } from 'react';
import {
  getCastingSuggestions,
  updateCastingSuggestion,
  type CastingSuggestionRow,
  type UpdateCastingSuggestionPayload,
} from '@/lib/api';

export function useCastingSuggestions(filmId: string) {
  const [suggestions, setSuggestions] = useState<CastingSuggestionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');

  const limit = 30;

  const fetchList = useCallback(async () => {
    if (!filmId) return;
    setLoading(true);
    setError(null);
    try {
      const data = await getCastingSuggestions({
        filmId,
        page,
        limit,
        ...(status ? { status } : {}),
      });
      setSuggestions(data.suggestions);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setSuggestions([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [filmId, page, status]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const totalPages = Math.ceil(total / limit) || 1;

  async function handleUpdateStatus(id: string, payload: UpdateCastingSuggestionPayload) {
    const result = await updateCastingSuggestion(id, payload);
    await fetchList();
    return result;
  }

  return {
    suggestions,
    total,
    page,
    totalPages,
    loading,
    error,
    status,
    setStatus,
    setPage,
    handleUpdateStatus,
    refetch: fetchList,
  };
}
