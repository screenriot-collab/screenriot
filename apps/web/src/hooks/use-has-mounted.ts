'use client';

import { useEffect, useState } from 'react';

/** Avoid hydration mismatch for client-only state (session, locale). */
export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    setMounted(true);
  }, []);
  return mounted;
}
