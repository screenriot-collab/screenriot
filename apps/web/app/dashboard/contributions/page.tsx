import { redirect } from 'next/navigation';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { fetchMyContributions } from '@/lib/contributions-api';
import { ContributionsView } from '@/components/contributions/ContributionsView';

export default async function ContributionsPage() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'filmmaker') {
    redirect('/dashboard');
  }

  const accessToken = session.accessToken;
  let contributions = [];
  try {
    contributions = await fetchMyContributions(accessToken);
  } catch (err) {
    console.error('Failed to fetch contributions:', err);
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Your Contributions</h1>
      <p className="mt-2 text-screenriot-muted">Track your proposed changes to published film pages.</p>
      <div className="mt-6">
        <ContributionsView contributions={contributions} />
      </div>
    </>
  );
}
