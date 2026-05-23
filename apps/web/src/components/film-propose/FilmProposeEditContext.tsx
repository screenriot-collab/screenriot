'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { useRouter } from 'next/navigation';
import { createContribution } from '@/lib/contributions-api';
import { buildContributionChanges, type ContributionPatch } from '@/lib/contribution-patches';
import { ProposeChangeModal, type ProposeFieldTarget } from './ProposeChangeModal';

interface FilmProposeEditContextValue {
  enabled: boolean;
  openEditor: (target: ProposeFieldTarget) => void;
}

const FilmProposeEditContext = createContext<FilmProposeEditContextValue | null>(null);

export function useFilmProposeEdit() {
  return useContext(FilmProposeEditContext);
}

interface FilmProposeEditProviderProps {
  enabled: boolean;
  filmId: string;
  accessToken: string;
  children: ReactNode;
  /** After successful submit, e.g. refresh list */
  onSubmitted?: () => void;
}

export function FilmProposeEditProvider({
  enabled,
  filmId,
  accessToken,
  children,
  onSubmitted,
}: FilmProposeEditProviderProps) {
  const router = useRouter();
  const [target, setTarget] = useState<ProposeFieldTarget | null>(null);

  const openEditor = useCallback((t: ProposeFieldTarget) => {
    setTarget(t);
  }, []);

  const handleSubmit = useCallback(
    async (newValue: string, reason: string) => {
      if (!target) return;
      const patch: ContributionPatch = {
        path: target.path,
        label: target.label,
        oldValue: target.oldValue,
        newValue,
      };
      await createContribution(
        {
          filmId,
          changes: buildContributionChanges(patch),
          comment: reason,
        },
        accessToken,
      );
      onSubmitted?.();
      router.push('/dashboard/contributions');
      router.refresh();
    },
    [target, filmId, accessToken, onSubmitted, router],
  );

  const value = useMemo(
    () => (enabled ? { enabled: true, openEditor } : null),
    [enabled, openEditor],
  );

  return (
    <FilmProposeEditContext.Provider value={value}>
      {children}
      {enabled && (
        <ProposeChangeModal
          target={target}
          onClose={() => setTarget(null)}
          onSubmit={handleSubmit}
        />
      )}
    </FilmProposeEditContext.Provider>
  );
}
