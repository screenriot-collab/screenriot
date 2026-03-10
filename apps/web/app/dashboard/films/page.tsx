import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { FilmsListWithActions } from '@/components/FilmsListWithActions';
import { FILMS_PAGE } from '@/markup/films';
import { fetchFilms } from '@/lib/films-api';
import { getVerification } from '@/lib/profile-api';
import { VerificationRequired } from '@/components/dashboard/VerificationRequired';

export default async function DashboardFilmsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'filmmaker') {
    redirect('/dashboard');
  }

  let isVerified = false;
  try {
    const v = await getVerification(session.accessToken);
    isVerified = v.status === 'verified';
  } catch {
    isVerified = false;
  }

  if (!isVerified) {
    return (
      <VerificationRequired
        title="My Films — Verification Required"
        description="To manage and submit film projects, your identity must be verified. Complete the verification process in your profile settings."
      />
    );
  }

  const accessToken = session.accessToken;
  let films: Awaited<ReturnType<typeof fetchFilms>> = [];
  try {
    films = await fetchFilms(accessToken);
  } catch {
    films = [];
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">{FILMS_PAGE.title}</h1>
      <p className="mt-2 text-screenriot-muted">{FILMS_PAGE.subtitle}</p>
      <div className="mt-6">
        <FilmsListWithActions films={films} />
      </div>
    </>
  );
}
