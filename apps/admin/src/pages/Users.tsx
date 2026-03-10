import { useNavigate } from 'react-router-dom';
import { useUsersList } from '@/hooks/useUsersList';
import { StatusPill } from '@/components/ui/StatusPill';
import { Pagination } from '@/components/ui/Pagination';
import { USER_TABS, VERIFICATION_TABS, VERIFICATION_STATUS_LABEL } from '@/constants/site-users';
import type { StatusVariant } from '@/components/ui/StatusPill';

function verificationVariant(status: string): StatusVariant {
  switch (status) {
    case 'pending': return 'warn';
    case 'verified': return 'ok';
    case 'rejected': return 'bad';
    default: return 'neutral';
  }
}

function roleVariant(role: string): StatusVariant {
  return role === 'filmmaker' ? 'info' : 'purple';
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

function userName(u: { displayName: string | null; firstName: string | null; lastName: string | null }) {
  if (u.displayName) return u.displayName;
  if (u.firstName || u.lastName) return [u.firstName, u.lastName].filter(Boolean).join(' ');
  return '—';
}

export default function Users() {
  const navigate = useNavigate();
  const {
    users,
    loading,
    error,
    roleTab,
    verificationTab,
    search,
    submittedSearch,
    page,
    total,
    totalPages,
    setSearch,
    setPage,
    changeRoleTab,
    changeVerificationTab,
    submitSearch,
    clearSearch,
  } = useUsersList();

  function handleSearchKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter') submitSearch();
  }

  return (
    <>
      <h1 className="text-2xl font-bold text-white">Users</h1>
      <p className="mt-1 text-sm text-gray-500">
        Browse registered fans and filmmakers. Check verification status.
      </p>

      {error && (
        <p className="mt-4 rounded-md bg-red-500/10 px-3 py-2 text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* Filters */}
      <div className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-1" role="tablist" aria-label="User role filters">
            {USER_TABS.map((t) => {
              const active = t.id === roleTab;
              return (
                <button
                  key={t.id}
                  type="button"
                  role="tab"
                  aria-selected={active}
                  onClick={() => changeRoleTab(t.id)}
                  className={`rounded-md px-3 py-1.5 text-sm font-medium transition-colors ${
                    active
                      ? 'bg-admin-accent/15 text-admin-accent'
                      : 'text-gray-400 hover:bg-white/[0.06] hover:text-gray-200'
                  }`}
                >
                  {t.label}
                </button>
              );
            })}
          </div>

          <div className="flex items-center gap-2">
            <div className="relative">
              <label className="sr-only" htmlFor="users-search">Search users</label>
              <input
                id="users-search"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onKeyDown={handleSearchKeyDown}
                placeholder="Name, email or username…"
                className="w-64 rounded-md border border-white/10 bg-admin-bg py-1.5 pl-3 pr-8 text-sm text-white placeholder:text-gray-600 focus:border-admin-accent/60 focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
              />
              {(search || submittedSearch) && (
                <button
                  type="button"
                  onClick={clearSearch}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                  aria-label="Clear search"
                >
                  ✕
                </button>
              )}
            </div>
            <button
              type="button"
              onClick={submitSearch}
              className="rounded-md bg-admin-accent/15 px-4 py-1.5 text-sm font-medium text-admin-accent transition-colors hover:bg-admin-accent/25 disabled:opacity-50"
              disabled={loading}
              aria-label="Search users"
            >
              Search
            </button>
          </div>
        </div>

        <div className="flex flex-wrap gap-1" role="tablist" aria-label="Verification status filters">
          <span className="mr-1 self-center text-xs text-gray-500">Verification:</span>
          {VERIFICATION_TABS.map((t) => {
            const active = t.id === verificationTab;
            return (
              <button
                key={t.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => changeVerificationTab(t.id)}
                className={`rounded-md px-2.5 py-1 text-xs font-medium transition-colors ${
                  active
                    ? 'bg-admin-accent/15 text-admin-accent'
                    : 'text-gray-400 hover:bg-white/[0.06] hover:text-gray-200'
                }`}
              >
                {t.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Count */}
      {!loading && (
        <p className="mt-4 text-xs text-gray-500">
          {total} {total === 1 ? 'user' : 'users'} found
          {submittedSearch && (
            <>
              {' '}for &ldquo;<span className="text-gray-400">{submittedSearch}</span>&rdquo;
            </>
          )}
        </p>
      )}

      {/* Table */}
      <div className="mt-3 overflow-x-auto rounded-xl border border-white/[0.06]">
        <table className="w-full text-left text-sm" role="table" aria-label="Users list">
          <thead>
            <tr className="border-b border-white/[0.06] bg-admin-sidebar">
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Name</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Email</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Role</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Verification</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Joined</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500">Last Admin Action</th>
              <th className="px-4 py-3 text-xs font-medium uppercase tracking-wide text-gray-500" />
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">Loading…</td>
              </tr>
            ) : users.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-4 py-8 text-center text-sm text-gray-500">No users found.</td>
              </tr>
            ) : (
              users.map((u) => (
                <tr key={u.id} className="border-b border-white/[0.04] transition-colors hover:bg-white/[0.02]">
                  <td className="px-4 py-3">
                    <span className="font-medium text-white">{userName(u)}</span>
                  </td>
                  <td className="px-4 py-3 text-gray-400">{u.email}</td>
                  <td className="px-4 py-3">
                    <StatusPill label={u.role} variant={roleVariant(u.role)} />
                  </td>
                  <td className="px-4 py-3">
                    <StatusPill
                      label={VERIFICATION_STATUS_LABEL[u.verificationStatus] ?? u.verificationStatus}
                      variant={verificationVariant(u.verificationStatus)}
                    />
                  </td>
                  <td className="px-4 py-3 text-gray-500">{formatDate(u.createdAt)}</td>
                  <td className="px-4 py-3">
                    {u.lastActionAt ? (
                      <>
                        <span className="text-gray-500">{formatDate(u.lastActionAt)}</span>
                        {u.lastActionBy && (
                          <span className="ml-1 text-xs text-gray-400">
                            {u.lastActionBy.username ?? 'admin'}
                          </span>
                        )}
                      </>
                    ) : (
                      <span className="text-gray-600">—</span>
                    )}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      onClick={() => navigate(`/users/${u.id}`)}
                      className="rounded bg-admin-accent/10 px-2.5 py-0.5 text-xs font-medium text-admin-accent transition-colors hover:bg-admin-accent/20"
                      aria-label={`View user ${userName(u)}`}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <Pagination page={page} totalPages={totalPages} loading={loading} onPageChange={setPage} />
    </>
  );
}
