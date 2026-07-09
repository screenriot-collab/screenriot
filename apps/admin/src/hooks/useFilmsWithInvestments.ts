import { useState, useEffect, useCallback } from 'react';
import { getFilmsWithInvestments, getFilmDonations } from '@/lib/api';
import type { FilmWithInvestments, FilmDonationRow } from '@/types/investments';

export function useFilmsWithInvestments() {
  const [films, setFilms] = useState<FilmWithInvestments[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<string>('');
  const [donationsByFilmId, setDonationsByFilmId] = useState<Record<string, FilmDonationRow[]>>({});
  const [loadingDonations, setLoadingDonations] = useState<Record<string, boolean>>({});

  const limit = 20;

  const fetchList = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await getFilmsWithInvestments({
        page,
        limit,
        ...(status ? { status } : {}),
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
  }, [page, status]);

  useEffect(() => {
    void fetchList();
  }, [fetchList]);

  async function loadDonationsForFilm(filmId: string) {
    if (donationsByFilmId[filmId]) return;
    setLoadingDonations((prev) => ({ ...prev, [filmId]: true }));
    try {
      const list = await getFilmDonations(filmId);
      setDonationsByFilmId((prev) => ({ ...prev, [filmId]: list }));
    } catch {
      setDonationsByFilmId((prev) => ({ ...prev, [filmId]: [] }));
    } finally {
      setLoadingDonations((prev) => ({ ...prev, [filmId]: false }));
    }
  }

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    films,
    total,
    page,
    totalPages,
    limit,
    loading,
    error,
    status,
    setPage,
    setStatus,
    donationsByFilmId,
    loadingDonations,
    loadDonationsForFilm,
    refetch: fetchList,
  };
}
