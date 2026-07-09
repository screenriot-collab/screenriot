import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchMyContributions, type Contribution } from '@/lib/contributions-api';
import { ContributionsView } from '@/components/contributions/ContributionsView';

export default async function ContributionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'filmmaker') {
    redirect('/dashboard');
  }

  const accessToken = session.accessToken;
  let contributions: Contribution[] = [];
  let fetchError: string | null = null;
  try {
    contributions = await fetchMyContributions(accessToken);
  } catch (err) {
    console.error('Failed to fetch contributions:', err);
    fetchError = err instanceof Error ? err.message : 'Failed to load contributions.';
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Your Contributions</h1>
      <p className="mt-2 text-screenriot-muted">Track your proposed changes to published film pages.</p>
      <div className="mt-6">
        {fetchError ? (
          <div className="rounded-xl border border-red-500/20 bg-red-500/10 p-6 text-center">
            <p className="text-sm text-red-400">{fetchError}</p>
            <p className="mt-2 text-xs text-screenriot-muted">
              Refresh the page to try again.
            </p>
          </div>
        ) : (
          <ContributionsView contributions={contributions} />
        )}
      </div>
    </>
  );
}
