import { useDashboardStats } from '@/hooks/useDashboardStats';
import {
  DashboardSection,
  DashboardPlaceholder,
  StatsCards,
  BarChartByStatus,
  PieChartByStatus,
} from '@/components/dashboard';

export default function Dashboard() {
  const { data, loading, error } = useDashboardStats();

  if (loading) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-gray-400">Loading stats…</p>
      </div>
    );
  }

  if (error) {
    return (
      <div>
        <h1 className="text-2xl font-bold text-white">Dashboard</h1>
        <p className="mt-2 text-red-400" role="alert">
          {error}
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-white">Dashboard</h1>
      <p className="mt-2 text-gray-400">
        Welcome to Screen Riot Admin. Overview of users, films, donations and verifications.
      </p>

      <div className="mt-8 grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {data && (
          <>
            <DashboardSection title="Users overview">
              <StatsCards
                items={[
                  { label: 'Total', value: data.users.total },
                  { label: 'Fans', value: data.users.fan },
                  { label: 'Filmmakers', value: data.users.filmmaker },
                  { label: 'Email verified', value: data.users.emailVerified },
                ]}
              />
            </DashboardSection>

            <DashboardPlaceholder title="Users over time" />

            <DashboardSection title="Films by status">
              <BarChartByStatus data={data.films.byStatus} />
              <p className="mt-3 text-sm text-gray-500">
                Published on site: <strong className="text-white">{data.films.publishedCount}</strong>
              </p>
            </DashboardSection>

            <DashboardSection title="Donations">
              <StatsCards
                items={[
                  { label: 'Total amount', value: `$${data.donations.totalAmount.toLocaleString()}` },
                  { label: 'Total count', value: data.donations.count },
                  { label: 'Completed', value: data.donations.completedCount },
                ]}
              />
            </DashboardSection>

            <DashboardPlaceholder title="Donations over time" />

            <DashboardSection title="Verifications by status">
              <PieChartByStatus data={data.verifications.byStatus} />
              {data.verifications.pendingCount > 0 && (
                <p className="mt-2 text-sm text-amber-400">
                  Pending review: {data.verifications.pendingCount}
                </p>
              )}
            </DashboardSection>

            <DashboardSection title="Payouts">
              <StatsCards
                items={[
                  { label: 'Pending sum', value: `$${data.payouts.pendingSum.toLocaleString()}` },
                  ...Object.entries(data.payouts.byStatus).map(([status, count]) => ({
                    label: `${status.charAt(0).toUpperCase() + status.slice(1)} (count)`,
                    value: count,
                  })),
                ]}
              />
            </DashboardSection>

            <DashboardSection title="Operational">
              <StatsCards
                items={[
                  { label: 'Films pending review', value: data.operational.filmsPendingReview },
                  { label: 'Verifications pending', value: data.operational.verificationsPending },
                ]}
              />
            </DashboardSection>
          </>
        )}
      </div>
    </div>
  );
}
