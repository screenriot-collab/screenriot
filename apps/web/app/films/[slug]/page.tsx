import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFilmDetailMock } from '@/markup/film-detail';
import { fetchFilmById, fetchFilmPageBySlug } from '@/lib/films-api';
import { apiFilmToFilmDetailMock } from '@/lib/film-page-mapper';
import { FilmDetailWithPropose } from '@/components/film-propose/FilmDetailWithPropose';

type PageProps = { params: Promise<{ slug: string }> };

const PUBLISHED_STATUSES = ['approved', 'fundraising', 'funded', 'closed'] as const;

export default async function FilmPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const sessionToken = (session as { accessToken?: string } | null)?.accessToken;
  const apiFilm = await fetchFilmPageBySlug(slug, sessionToken);
  const defaultMock = getFilmDetailMock(slug);
  const film = apiFilm ? apiFilmToFilmDetailMock(apiFilm, defaultMock) : defaultMock;

  let canPropose = false;
  let accessToken: string | undefined;

  if (
    session?.user?.role === 'filmmaker' &&
    apiFilm?.id &&
    (session as { accessToken?: string }).accessToken
  ) {
    accessToken = (session as { accessToken?: string }).accessToken;
    try {
      const owned = await fetchFilmById(apiFilm.id, accessToken);
      canPropose =
        owned !== null &&
        PUBLISHED_STATUSES.includes(owned.status as (typeof PUBLISHED_STATUSES)[number]) &&
        Boolean(owned.pagePublished);
    } catch {
      canPropose = false;
    }
  }

  return (
    <FilmDetailWithPropose
      film={film}
      filmId={apiFilm?.id}
      slug={slug}
      canPropose={canPropose}
      accessToken={accessToken}
    />
  );
}
