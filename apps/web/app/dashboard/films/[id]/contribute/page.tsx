import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchFilmById } from '@/lib/films-api';
import { NewContributionForm } from '@/components/contributions/NewContributionForm';

interface PageProps {
  params: { id: string };
}

export default async function NewContributionPage({ params }: PageProps) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'filmmaker') {
    redirect('/dashboard');
  }

  let film;
  try {
    film = await fetchFilmById(params.id, session.accessToken);
  } catch {
    redirect('/dashboard/films');
  }

  // Ensure film is approved and belongs to the user
  if (
    (film.status !== 'approved' && film.status !== 'fundraising' && film.status !== 'funded' && film.status !== 'closed') ||
    !film.pagePublished
  ) {
    redirect('/dashboard/films');
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Propose Changes</h1>
      <p className="mt-2 text-screenriot-muted">
        Submit a request to update the public information for <strong>{film.title}</strong>. 
        Your request will be reviewed by our moderators before being applied.
      </p>
      
      <div className="mt-8 max-w-2xl">
        <NewContributionForm filmId={film.id} accessToken={session.accessToken} />
      </div>
    </>
  );
}
