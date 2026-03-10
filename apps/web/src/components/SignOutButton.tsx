'use client';

import { signOut } from 'next-auth/react';

export function SignOutButton() {
  return (
    <button
      type="button"
      onClick={() => signOut({ callbackUrl: '/', redirect: true })}
      className="rounded bg-white/10 px-3 py-1.5 text-sm font-medium text-gray-200 hover:bg-white/20 focus:outline-none"
      aria-label="Sign out"
    >
      Sign out
    </button>
  );
}
