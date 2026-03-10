'use client';

import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { FilmsListView } from '@/components/FilmsListView';
import { deleteFilm } from '@/lib/films-api';
import type { FilmListItem } from '@/markup/films';

interface FilmsListWithActionsProps {
  films: FilmListItem[];
}

export function FilmsListWithActions({ films }: FilmsListWithActionsProps) {
  const router = useRouter();
  const { data: session } = useSession();
  const accessToken = session?.accessToken;

  async function handleDelete(filmId: string) {
    try {
      await deleteFilm(filmId, accessToken);
      router.refresh();
    } catch (err) {
      console.error('Delete film failed:', err);
      window.alert('Failed to delete project. Try again.');
    }
  }

  return <FilmsListView films={films} onDelete={handleDelete} />;
}
