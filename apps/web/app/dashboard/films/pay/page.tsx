import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchFilmById } from '@/lib/films-api';
import { PaymentForm } from './PaymentForm';

type PageProps = { searchParams: Promise<{ film?: string }> };

export default async function FilmsPayPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'filmmaker') {
    redirect('/dashboard');
  }

  const params = await searchParams;
  const filmId = params.film;
  if (!filmId) {
    redirect('/dashboard/films');
  }

  const film = await fetchFilmById(filmId, session.accessToken);
  if (!film) {
    redirect('/dashboard/films');
  }

  if (film.submissionFeePaid) {
    redirect('/dashboard/films');
  }

  return <PaymentForm filmId={film.id} filmTitle={film.title} />;
}
