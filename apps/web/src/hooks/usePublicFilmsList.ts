import { useCallback, useEffect, useState } from 'react';
import {
  fetchPublicFilmsList,
  apiCardToPlaceholder,
  type ApiPublicFilmCard,
} from '@/lib/films-api';
import type { PlaceholderFilm } from '@/markup/home';

export type PublicFilmCardView = PlaceholderFilm & {
  slug?: string;
  posterUrl?: string;
  aiMarketScore?: number;
  predictedROI?: string;
  hasCommunityScore: boolean;
  hasAiMarketScore: boolean;
  hasPredictedRoi: boolean;
};

type UsePublicFilmsListOptions = {
  limit: number;
  initialPage?: number;
  initialGenre?: string;
  initialSearch?: string;
  initialFilms?: PublicFilmCardView[];
  initialTotal?: number;
  genreOptions: readonly string[];
};

export function usePublicFilmsList({
  limit,
  initialPage = 1,
  initialGenre,
  initialSearch = '',
  initialFilms,
  initialTotal,
  genreOptions,
}: UsePublicFilmsListOptions) {
  const [genre, setGenre] = useState<string>(initialGenre ?? genreOptions[0] ?? 'All');
  const [page, setPage] = useState(initialPage);
  const [search, setSearch] = useState(initialSearch);
  const [submittedSearch, setSubmittedSearch] = useState(initialSearch);
  const [films, setFilms] = useState<PublicFilmCardView[]>(initialFilms ?? []);
  const [total, setTotal] = useState(initialTotal ?? 0);
  const [loading, setLoading] = useState(initialFilms === undefined);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetchPublicFilmsList({
        page,
        limit,
        genre: genre === 'All' ? undefined : genre,
        search: submittedSearch || undefined,
      });
      setFilms(res.films.map((api: ApiPublicFilmCard) => apiCardToPlaceholder(api)));
      setTotal(res.total);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load films');
      setFilms([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  }, [page, limit, genre, submittedSearch]);

  useEffect(() => {
    void load();
  }, [load]);

  const totalPages = Math.ceil(total / limit) || 1;

  return {
    films,
    total,
    loading,
    error,
    genre,
    setGenre,
    search,
    setSearch,
    submittedSearch,
    setSubmittedSearch,
    page,
    setPage,
    totalPages,
    reload: load,
  };
}
