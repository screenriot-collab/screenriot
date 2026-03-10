import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/auth';
import { SubmitProjectWizard } from '@/components/SubmitProjectWizard';
import { fetchFilmById, apiFilmToFormData } from '@/lib/films-api';
import { getVerification } from '@/lib/profile-api';
import { VerificationRequired } from '@/components/dashboard/VerificationRequired';

type PageProps = { searchParams: Promise<{ film?: string }> };

export default async function SubmitProjectPage({ searchParams }: PageProps) {
  const session = await getServerSession(authOptions);
  const role = session?.user?.role;
  if (role !== 'filmmaker') {
    redirect('/dashboard');
  }

  let isVerified = false;
  try {
    const v = await getVerification(session?.accessToken);
    isVerified = v.status === 'verified';
  } catch {
    isVerified = false;
  }

  if (!isVerified) {
    return (
      <VerificationRequired
        title="Submit Project — Verification Required"
        description="To submit a film project, your identity must be verified first. Complete the verification process in your profile settings."
      />
    );
  }

  const params = await searchParams;
  const filmId = params.film ?? undefined;
  let initialData: ReturnType<typeof apiFilmToFormData> | undefined;
  let submissionFeePaid = false;
  let reviewStatus: string | null = null;
  let reviewComments: Record<string, string> | null = null;
  if (filmId) {
    const accessToken = session?.accessToken;
    const film = await fetchFilmById(filmId, accessToken);
    if (film) {
      initialData = apiFilmToFormData(film);
      submissionFeePaid = film.submissionFeePaid;
      reviewStatus = film.reviewStatus;
      reviewComments = (film.reviewComments as Record<string, string>) ?? null;
    }
  }
  return (
    <SubmitProjectWizard
      initialData={initialData}
      filmId={filmId}
      submissionFeePaid={filmId ? submissionFeePaid : undefined}
      reviewStatus={reviewStatus}
      reviewComments={reviewComments}
    />
  );
}
