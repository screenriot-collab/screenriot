import { useCallback, useEffect, useState } from 'react';
import { getCastingSuggestionFilms } from '@/lib/api';
import type { CastingSuggestionFilmSummary } from '@/types/casting-suggestions';

export function useCastingSuggestionFilms() {
  const [films, setFilms] = useState<CastingSuggestionFilmSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [search, setSearch] = useState('');

  const limit = 20;

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getCastingSuggestionFilms({
        page,
        limit,
        ...(status ? { status } : {}),
        ...(search ? { search } : {}),
      });
      setFilms(data.films);
      setTotal(data.total);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Failed to load');
      setFilms([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, status, search]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  const totalPages = Math.ceil(total / limit) || 1;

  function applySearch() {
    setPage(1);
    setSearch(searchInput.trim());
  }

  return {
    films,
    total,
    page,
    totalPages,
    loading,
    error,
    status,
    setStatus,
    searchInput,
    setSearchInput,
    applySearch,
    setPage,
    refetch: fetchList,
  };
}
