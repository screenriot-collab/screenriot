export type NavItem = {
  to: string;
  label: string;
};

export const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Dashboard' },
  { to: '/admins', label: 'Admins' },
  { to: '/mods', label: 'Mods' },
  { to: '/users', label: 'Users' },
  { to: '/films', label: 'Applications' },
  { to: '/film-pages', label: 'Film pages' },
  { to: '/contributions', label: 'Contributions' },
  { to: '/films-with-investments', label: 'Films with investments' },
  { to: '/script-credit-purchases', label: 'Script credits' },
  { to: '/submission-fee-payments', label: 'Submission fees' },
  { to: '/casting-suggestions', label: 'Casting suggestions' },
];
