import { GENRES } from '@/markup/home';
import { DISCOVER_PAGE_SIZE } from '@/lib/constants';
import { fetchPublicFilmsList, apiCardToPlaceholder, type ApiPublicFilmCard } from '@/lib/films-api';
import { DiscoverFilmsClient } from './DiscoverFilmsClient';
import type { PublicFilmCardView } from '@/hooks/usePublicFilmsList';

type SearchParams = Promise<{ page?: string; genre?: string; search?: string }>;

export default async function DiscoverFilmsPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { page: pageParam, genre: genreParam, search: searchParam } = await searchParams;

  const initialPage = Math.max(1, Number(pageParam) || 1);
  const initialGenre =
    genreParam && (GENRES as readonly string[]).includes(genreParam) ? genreParam : 'All';
  const initialSearch = searchParam ?? '';

  let initialFilms: PublicFilmCardView[] = [];
  let initialTotal = 0;

  try {
    const res = await fetchPublicFilmsList({
      page: initialPage,
      limit: DISCOVER_PAGE_SIZE,
      genre: initialGenre !== 'All' ? initialGenre : undefined,
      search: initialSearch || undefined,
    });
    initialFilms = res.films.map((api: ApiPublicFilmCard) => apiCardToPlaceholder(api));
    initialTotal = res.total;
  } catch {
    // client component will handle the error state on the next interaction
  }

  return (
    <div className="min-h-screen bg-screenriot-bg">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">Discover Films</h1>
        <p className="mt-2 text-screenriot-muted">
          Browse and support independent film projects. Vote, invest, and follow your favorites.
        </p>
        <DiscoverFilmsClient
          initialFilms={initialFilms}
          initialTotal={initialTotal}
          initialPage={initialPage}
          initialGenre={initialGenre}
          initialSearch={initialSearch}
        />
      </div>
    </div>
  );
}
