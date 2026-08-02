import { useCallback, useEffect, useState } from 'react';
import { getFilm, updateFilmReview } from '@/lib/api';
import type { AdminFilmDetail, ReviewComments } from '@/types/films';

export function useFilmDetail(id: string | undefined) {
  const [detail, setDetail] = useState<AdminFilmDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const emptyComments: Required<ReviewComments> = {
    step1: '',
    step2: '',
    step3: '',
    step4: '',
    step5: '',
  };
  const [comments, setComments] = useState<Required<ReviewComments>>(emptyComments);
  // Snapshot of the comments as last loaded from the server, to detect whether
  // there's anything new to save before allowing "Update request".
  const [savedComments, setSavedComments] = useState<Required<ReviewComments>>(emptyComments);
  const [reviewStatus, setReviewStatus] = useState<'action_required' | 'no_action' | 'changes_submitted'>('no_action');

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const res = await getFilm(id);
      setDetail(res);
      const rc = res.film.reviewComments ?? {};
      const loadedComments: Required<ReviewComments> = {
        step1: rc.step1 ?? '',
        step2: rc.step2 ?? '',
        step3: rc.step3 ?? '',
        step4: rc.step4 ?? '',
        step5: rc.step5 ?? '',
      };
      setComments(loadedComments);
      setSavedComments(loadedComments);
      setReviewStatus(res.film.reviewStatus ?? 'no_action');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load film');
    } finally {
      setLoading(false);
    }
  }, [id]);

  const commentsChanged = (Object.keys(comments) as (keyof ReviewComments)[]).some(
    (step) => comments[step] !== savedComments[step],
  );

  useEffect(() => {
    void load();
  }, [load]);

  async function applyAction(body: { status?: string }) {
    if (!id) return;
    setActionLoading(true);
    setError('');
    try {
      await updateFilmReview(id, {
        ...body,
        reviewStatus,
        reviewComments: comments,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  }

  /** Sends the film back to the filmmaker and flags it as needing their attention, in one step. */
  async function requestChanges() {
    if (!id) return;
    const hasComment = Object.values(comments).some((c) => c.trim());
    if (!hasComment) {
      setError('Add a comment on at least one step before requesting changes.');
      return;
    }
    if (reviewStatus === 'action_required' && !commentsChanged) {
      setError('No new comments to update — edit a step comment first.');
      return;
    }
    setActionLoading(true);
    setError('');
    try {
      await updateFilmReview(id, {
        status: 'pending_approval',
        reviewStatus: 'action_required',
        reviewComments: comments,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  }

  /** Clears the review flag (action_required or changes_submitted) without changing the film's status. */
  async function resetReviewStatus() {
    if (!id) return;
    setActionLoading(true);
    setError('');
    try {
      await updateFilmReview(id, {
        reviewStatus: 'no_action',
        reviewComments: comments,
      });
      await load();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Action failed');
    } finally {
      setActionLoading(false);
    }
  }

  function updateComment(step: keyof ReviewComments, value: string) {
    setComments((prev) => ({ ...prev, [step]: value }));
  }

  return {
    detail,
    loading,
    error,
    actionLoading,
    comments,
    commentsChanged,
    reviewStatus,
    updateComment,
    applyAction,
    requestChanges,
    resetReviewStatus,
  };
}
