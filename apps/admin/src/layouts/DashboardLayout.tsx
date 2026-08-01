import { useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { clearToken, getCurrentUser } from '@/lib/api';
import { NAV_ITEMS } from '@/constants/navigation';
import { LogoutIcon } from '@/components/ui/icons/LogoutIcon';

const ADMINS_AND_USERS_PATHS = ['/admins', '/users'];

export default function DashboardLayout() {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const navItems =
    currentUser?.role === 'manager'
      ? NAV_ITEMS.filter((item) => !ADMINS_AND_USERS_PATHS.includes(item.to))
      : NAV_ITEMS;

  useEffect(() => {
    if (currentUser?.role === 'manager' && ADMINS_AND_USERS_PATHS.some((p) => pathname.startsWith(p))) {
      navigate('/', { replace: true });
    }
  }, [currentUser?.role, pathname, navigate]);

  function isActive(to: string) {
    if (to === '/') return pathname === '/';
    return pathname === to || pathname.startsWith(`${to}/`);
  }

  function handleSignOut() {
    clearToken();
    navigate('/login', { replace: true });
    window.location.reload();
  }

  return (
    <div className="flex min-h-screen">
      <aside className="flex w-56 shrink-0 flex-col border-r border-gray-600 bg-admin-sidebar">
        <div className="border-b border-white/10 bg-admin-bg/60">
          <div className="flex justify-center px-3 py-6">
            <img src="/images/screenriot-logo.png" alt="Screen Riot" className="h-8 w-auto" />
          </div>
          {currentUser && (
            <div className="border-t border-white/10 px-3 py-4 text-center" aria-label="Current user">
              <p className="truncate text-sm font-medium text-white" title={currentUser.username || currentUser.email}>
                {currentUser.username || currentUser.email}
              </p>
            </div>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4">
          <nav className="flex flex-col gap-1" aria-label="Main navigation">
            {navItems.map((item) => (
              <Link
                key={item.to}
                to={item.to}
                className={`rounded px-3 py-2 text-sm font-medium ${
                  isActive(item.to)
                    ? 'bg-admin-card text-white'
                    : 'text-gray-400 hover:bg-admin-card hover:text-white'
                }`}
                aria-current={isActive(item.to) ? 'page' : undefined}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          <button
            type="button"
            onClick={handleSignOut}
            className="mt-auto flex w-full items-center justify-center rounded bg-red-500/10 px-3 py-2 text-sm font-medium text-red-300 transition-colors hover:bg-red-500/20"
          >
            Sign out
            <LogoutIcon />
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
