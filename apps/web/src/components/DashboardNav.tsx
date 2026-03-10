'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

type NavItem = {
  href: string;
  label: string;
  roles?: ('fan' | 'filmmaker')[];
  requiresVerification?: boolean;
};

const items: NavItem[] = [
  { href: '/dashboard', label: 'Dashboard' },
  { href: '/dashboard/submit-project', label: 'Submit Project', roles: ['filmmaker'], requiresVerification: true },
  { href: '/dashboard/films', label: 'My Films', roles: ['filmmaker'], requiresVerification: true },
  { href: '/dashboard/contributions', label: 'Contributions', roles: ['filmmaker'], requiresVerification: true },
  { href: '/dashboard/tracked', label: 'Tracked Films' },
];

type Props = {
  userRole?: string;
  isVerified?: boolean;
};

export function DashboardNav({ userRole, isVerified }: Props) {
  const pathname = usePathname();

  const visibleItems = items.filter(
    (item) => !item.roles || (userRole && item.roles.includes(userRole as 'fan' | 'filmmaker'))
  );

  return (
    <nav className="flex flex-col gap-1" aria-label="Dashboard menu">
      {visibleItems.map((item) => {
        const isActive =
          pathname === item.href ||
          (item.href !== '/dashboard' && pathname?.startsWith(item.href));
        const locked = item.requiresVerification && !isVerified;

        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex items-center justify-between rounded px-3 py-2 text-sm font-medium focus:outline-none ${
              locked
                ? 'text-gray-600 hover:bg-white/5 hover:text-gray-500'
                : isActive
                  ? 'bg-white/15 text-white'
                  : 'text-screenriot-muted hover:bg-white/10 hover:text-white'
            }`}
            aria-current={isActive && !locked ? 'page' : undefined}
          >
            <span>{item.label}</span>
            {locked && (
              <svg
                className="h-3.5 w-3.5 shrink-0 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                strokeWidth={2}
                stroke="currentColor"
                aria-label="Verification required"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M16.5 10.5V6.75a4.5 4.5 0 1 0-9 0v3.75m-.75 11.25h10.5a2.25 2.25 0 0 0 2.25-2.25v-6.75a2.25 2.25 0 0 0-2.25-2.25H6.75a2.25 2.25 0 0 0-2.25 2.25v6.75a2.25 2.25 0 0 0 2.25 2.25Z"
                />
              </svg>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
