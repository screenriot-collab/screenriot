import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { TrackedFilmsView } from '@/components/TrackedFilmsView';

export default async function DashboardTrackedPage() {
  await getServerSession(authOptions);

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Tracked films</h1>
      <p className="mt-2 text-screenriot-muted">
        Films you have donated to. One source with Investor Dashboard.
      </p>
      <div className="mt-6">
        <TrackedFilmsView />
      </div>
    </>
  );
}
