import { useCallback, useEffect, useState } from 'react';
import { listFilms } from '@/lib/api';
import type { AdminFilmListItem } from '@/types/films';
import { PAGE_SIZE } from '@/constants/films';

export function useFilmPagesList() {
  const [search, setSearch] = useState('');
  const [submittedSearch, setSubmittedSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [films, setFilms] = useState<AdminFilmListItem[]>([]);
  const [total, setTotal] = useState(0);

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const reload = useCallback(async (p: number, searchStr: string) => {
    setLoading(true);
    setError('');
    try {
      const res = await listFilms({
        published: true,
        search: searchStr || undefined,
        page: p,
        limit: PAGE_SIZE,
      });
      setFilms(res.films);
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void reload(page, submittedSearch);
  }, [page, submittedSearch, reload]);

  function submitSearch() {
    setSubmittedSearch(search.trim());
    setPage(1);
  }

  function clearSearch() {
    setSearch('');
    setSubmittedSearch('');
    setPage(1);
  }

  return {
    films,
    loading,
    error,
    search,
    submittedSearch,
    page,
    total,
    totalPages,
    setSearch,
    setPage,
    submitSearch,
    clearSearch,
    reload: () => reload(page, submittedSearch),
  };
}
