'use client';

import { HOME_HERO, GENRES } from '@/markup/home';
import { IMAGES, HOME_FILMS_LIMIT } from '@/lib/constants';
import { usePublicFilmsList } from '@/hooks/usePublicFilmsList';
import { FilmCard } from '@/components/films/FilmCard';

function HeroSearchIcon() {
  return (
    /* eslint-disable-next-line @next/next/no-img-element */
    <img
      src={IMAGES.icons.search}
      alt=""
      width={20}
      height={20}
      className="h-5 w-5 shrink-0"
      aria-hidden
    />
  );
}

export function HomeHeroAndFilms() {
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
  } = usePublicFilmsList({
    limit: HOME_FILMS_LIMIT,
    initialPage: 1,
    genreOptions: [...GENRES],
  });

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmittedSearch(search);
    setPage(1);
  };

  return (
    <>
      <section className="border-b border-white/10 bg-screenriot-bg px-6 pb-16 pt-12">
        <div className="mx-auto max-w-4xl text-center">
          <h1 className="text-3xl font-bold tracking-tight text-white sm:text-5xl">
            {HOME_HERO.title}
          </h1>
          <p className="mt-4 text-2xl font-medium text-screenriot-accent">
            {HOME_HERO.subtitle}
          </p>
          <p className="mt-4 text-screenriot-muted">{HOME_HERO.description}</p>
          <form onSubmit={handleSearchSubmit} className="mt-8">
            <label htmlFor="hero-search" className="sr-only">
              Search film projects
            </label>
            <div className="relative mx-auto max-w-xl">
              <span
                className="pointer-events-none absolute inset-y-0 left-4 flex items-center text-screenriot-muted"
                aria-hidden
              >
                <HeroSearchIcon />
              </span>
              <input
                id="hero-search"
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder={HOME_HERO.searchPlaceholder}
                className="w-full rounded-lg border border-white/20 bg-screenriot-bg-card py-3 pl-12 pr-4 text-white placeholder:text-screenriot-muted focus:outline-none focus:border-white/40"
                aria-label="Search film projects"
              />
            </div>
            <div className="mt-6 flex flex-wrap justify-center gap-2" role="tablist" aria-label="Filter by genre">
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
          </form>
        </div>
      </section>

      <section id="discover" className="border-b border-white/10 px-6 py-8">
        <div className="mx-auto max-w-7xl">
          <h2 className="flex items-center gap-2 text-xl font-bold text-white">
            <span className="text-screenriot-accent" aria-hidden>★</span>
            Top Rated Projects
          </h2>
          <p className="mt-1 text-sm text-screenriot-muted">
            Community favorites based on story, script, and casting votes.
          </p>
        </div>
      </section>

      <section className="px-6 py-10">
        <div className="mx-auto max-w-7xl">
          <div className="flex items-baseline justify-between gap-4">
            <h2 className="text-2xl font-bold text-white">All Film Projects</h2>
            <p className="text-sm text-screenriot-muted">
              {loading ? '…' : `${total} active projects`}
              {genre !== 'All' && ` in ${genre}`}
            </p>
          </div>

          {error && (
            <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          {loading ? (
            <div className="mt-8 rounded-xl border border-white/10 bg-screenriot-bg-card p-12 text-center">
              <p className="text-screenriot-muted">Loading…</p>
            </div>
          ) : films.length === 0 ? (
            <div className="mt-8 rounded-xl border border-white/10 bg-screenriot-bg-card p-12 text-center">
              <p className="text-screenriot-muted">No projects in this category yet.</p>
            </div>
          ) : (
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {films.map((film) => (
                <FilmCard key={film.id} film={film} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
