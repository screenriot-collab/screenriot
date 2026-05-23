import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchFilmById, fetchFilmPageBySlug } from '@/lib/films-api';
import { getFilmDetailMock } from '@/markup/film-detail';
import { apiFilmToFilmDetailMock } from '@/lib/film-page-mapper';
import { FilmDetailWithPropose } from '@/components/film-propose/FilmDetailWithPropose';

const PUBLISHED_STATUSES = ['approved', 'fundraising', 'funded', 'closed'] as const;

export default async function FilmPreviewPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'filmmaker') {
    redirect('/dashboard');
  }

  const accessToken = (session as { accessToken?: string }).accessToken;
  if (!accessToken) {
    redirect('/dashboard');
  }

  const film = await fetchFilmById(id, accessToken);
  if (!film) {
    redirect('/dashboard/films');
  }

  if (
    !PUBLISHED_STATUSES.includes(film.status as (typeof PUBLISHED_STATUSES)[number]) ||
    !film.pagePublished
  ) {
    redirect('/dashboard/films');
  }

  const apiFilm = await fetchFilmPageBySlug(film.slug);
  const defaultMock = getFilmDetailMock(film.slug);
  const filmDetail = apiFilm
    ? apiFilmToFilmDetailMock(apiFilm, defaultMock)
    : defaultMock;

  return (
    <>
      <div className="border-b border-white/10 bg-screenriot-bg px-4 py-4">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3">
          <div>
            <Link
              href="/dashboard/films"
              className="text-sm text-screenriot-muted hover:text-white"
            >
              ← My Films
            </Link>
            <h1 className="mt-1 text-lg font-semibold text-white">
              Page preview — {film.title}
            </h1>
          </div>
          <Link
            href={`/films/${film.slug}`}
            className="text-sm font-medium text-screenriot-accent-blue hover:underline"
            target="_blank"
            rel="noopener noreferrer"
          >
            Open live page
          </Link>
        </div>
      </div>
      <FilmDetailWithPropose
        film={filmDetail}
        filmId={film.id}
        slug={film.slug}
        canPropose
        accessToken={accessToken}
        previewBanner
      />
    </>
  );
}
