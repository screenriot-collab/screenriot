import { useCallback, useEffect, useState } from 'react';
import { getFilm, updateFilmPage, uploadFilmPageFile } from '@/lib/api';
import {
  buildFormFromDetail,
  buildFilmPageUpdatePayload,
} from '@/lib/filmPageForm';
import type { AdminFilmDetail, FilmPageFormState } from '@/types/films';

export function useFilmPageEdit(id: string | undefined) {
  const [detail, setDetail] = useState<AdminFilmDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<'poster' | 'teaser' | null>(
    null,
  );
  const [error, setError] = useState('');
  const [form, setForm] = useState<FilmPageFormState>({});

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await getFilm(id);
      setDetail(res);
      setForm(buildFormFromDetail(res));
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Failed to load film',
      );
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  const handleFileUpload = useCallback(
    async (slot: 'poster' | 'teaser', file: File) => {
      if (!id) return;
      setUploadingSlot(slot);
      setError('');
      try {
        await uploadFilmPageFile(id, slot, file);
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setUploadingSlot(null);
      }
    },
    [id, load],
  );

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();
      if (!id) return;
      setSaving(true);
      setError('');
      try {
        const payload = buildFilmPageUpdatePayload(form);
        await updateFilmPage(id, payload);
        await load();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Save failed');
      } finally {
        setSaving(false);
      }
    },
    [id, form, load],
  );

  return {
    detail,
    loading,
    error,
    form,
    setForm,
    saving,
    uploadingSlot,
    reload: load,
    handleFileUpload,
    handleSubmit,
  };
}
