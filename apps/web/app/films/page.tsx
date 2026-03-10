'use client';

import { GENRES } from '@/markup/home';
import { DISCOVER_PAGE_SIZE } from '@/lib/constants';
import { usePublicFilmsList } from '@/hooks/usePublicFilmsList';
import { FilmCard } from '@/components/films/FilmCard';

export default function DiscoverFilmsPage() {
  const {
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
  } = usePublicFilmsList({
    limit: DISCOVER_PAGE_SIZE,
    initialPage: 1,
    genreOptions: [...GENRES],
  });

  return (
    <div className="min-h-screen bg-screenriot-bg">
      <div className="mx-auto max-w-7xl px-6 py-8">
        <h1 className="text-2xl font-bold text-white sm:text-3xl">
          Discover Films
        </h1>
        <p className="mt-2 text-screenriot-muted">
          Browse and support independent film projects. Vote, invest, and
          follow your favorites.
        </p>

        <div className="mt-6 flex flex-wrap items-center gap-4">
          <div
            className="flex flex-wrap gap-2"
            role="tablist"
            aria-label="Filter by genre"
          >
            {GENRES.map((g) => (
              <button
                key={g}
                type="button"
                role="tab"
                aria-selected={genre === g}
                onClick={() => {
                  setGenre(g);
                  setPage(1);
                }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg ${
                  genre === g
                    ? 'bg-screenriot-accent text-screenriot-bg'
                    : 'bg-white/10 text-gray-300 hover:bg-white/20'
                }`}
              >
                {g}
              </button>
            ))}
          </div>
          <form
            className="flex gap-2"
            onSubmit={(e) => {
              e.preventDefault();
              setSubmittedSearch(search);
              setPage(1);
            }}
          >
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search films..."
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white placeholder:text-gray-500 focus:border-screenriot-accent-blue focus:outline-none"
              aria-label="Search films"
            />
            <button
              type="submit"
              className="rounded-lg bg-white/10 px-4 py-2 text-sm font-medium text-white hover:bg-white/20"
            >
              Search
            </button>
          </form>
        </div>

        <div className="mt-8 flex items-baseline justify-between gap-4">
          <h2 className="text-xl font-semibold text-white">
            All Film Projects
          </h2>
          <p className="text-sm text-screenriot-muted">
            {loading ? '…' : `${total} ${total === 1 ? 'project' : 'projects'}`}
            {genre !== 'All' && ` in ${genre}`}
          </p>
        </div>

        {error && (
          <p
            className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}

        {loading ? (
          <div className="mt-10 rounded-xl border border-white/10 bg-screenriot-bg-card p-12 text-center">
            <p className="text-screenriot-muted">Loading…</p>
          </div>
        ) : films.length === 0 ? (
          <div className="mt-10 rounded-xl border border-white/10 bg-screenriot-bg-card p-12 text-center">
            <p className="text-screenriot-muted">
              No projects in this category yet.
            </p>
            <button
              type="button"
              onClick={() => setGenre('All')}
              className="mt-4 text-sm font-medium text-screenriot-accent-blue hover:underline"
            >
              View all films
            </button>
          </div>
        ) : (
          <>
            <div className="mt-6 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {films.map((film) => (
                <FilmCard key={film.id} film={film} />
              ))}
            </div>
            {totalPages > 1 && (
              <nav
                className="mt-8 flex justify-center gap-2"
                aria-label="Pagination"
              >
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page <= 1}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-white/10"
                >
                  Previous
                </button>
                <span className="flex items-center px-4 py-2 text-sm text-gray-400">
                  Page {page} of {totalPages}
                </span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={page >= totalPages}
                  className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-white disabled:opacity-50 hover:bg-white/10"
                >
                  Next
                </button>
              </nav>
            )}
          </>
        )}
      </div>
    </div>
  );
}
