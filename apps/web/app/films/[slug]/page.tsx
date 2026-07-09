import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { getFilmDetailMock } from '@/markup/film-detail';
import { fetchFilmPageBySlug } from '@/lib/films-api';
import { apiFilmToFilmDetailMock } from '@/lib/film-page-mapper';
import { FilmDetailWithPropose } from '@/components/film-propose/FilmDetailWithPropose';
import { resolveCanPropose } from '@/lib/film-access';

type PageProps = { params: Promise<{ slug: string }> };

export default async function FilmPage({ params }: PageProps) {
  const { slug } = await params;
  const session = await getServerSession(authOptions);
  const sessionToken = (session as { accessToken?: string } | null)?.accessToken;
  const apiFilm = await fetchFilmPageBySlug(slug, sessionToken);
  const defaultMock = getFilmDetailMock(slug);
  const film = apiFilm ? apiFilmToFilmDetailMock(apiFilm, defaultMock) : defaultMock;

  const accessToken = (session as { accessToken?: string } | null)?.accessToken;
  const canPropose =
    session?.user?.role === 'filmmaker' && apiFilm?.id && accessToken
      ? await resolveCanPropose(apiFilm.id, accessToken)
      : false;

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
