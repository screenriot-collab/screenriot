import { useState, useEffect, useCallback } from 'react';
import { getSiteUser, updateSiteUser, reviewVerification, reviewDocument } from '@/lib/api';
import type { SiteUserDetail, VerificationDocument } from '@/types/site-users';

export type SiteUserEditFields = {
  firstName: string;
  lastName: string;
  displayName: string;
  email: string;
  phone: string;
  country: string;
  city: string;
  bio: string;
  role: string;
};

export function useSiteUserDetail(id: string | undefined) {
  const [user, setUser] = useState<SiteUserDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionError, setActionError] = useState('');

  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState<Partial<SiteUserEditFields>>({});
  const [saving, setSaving] = useState(false);

  const [feedback, setFeedback] = useState('');
  const [docComments, setDocComments] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(async () => {
    if (!id) return;
    setLoading(true);
    setError('');
    try {
      const u = await getSiteUser(id);
      setUser(u);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load user');
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    void load();
  }, [load]);

  function startEdit() {
    if (!user) return;
    setEditForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      displayName: user.displayName ?? '',
      email: user.email,
      phone: user.phone ?? '',
      country: user.country ?? '',
      city: user.city ?? '',
      bio: user.bio ?? '',
      role: user.role,
    });
    setEditing(true);
    setActionError('');
  }

  function cancelEdit() {
    setEditing(false);
    setEditForm({});
  }

  async function saveEdit() {
    if (!user) return;
    setSaving(true);
    setActionError('');
    try {
      const body: Record<string, unknown> = {};
      for (const [key, val] of Object.entries(editForm)) {
        if (val !== '') body[key] = val;
      }
      const updated = await updateSiteUser(user.id, body);
      setUser(updated);
      setEditing(false);
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to save');
    } finally {
      setSaving(false);
    }
  }

  async function handleReview(action: 'approve' | 'reject') {
    if (!user?.verification?.id) return;
    if (action === 'reject' && !feedback.trim()) {
      setActionError('Please provide feedback before rejecting.');
      return;
    }
    setSubmitting(true);
    setActionError('');
    try {
      await reviewVerification(user.verification.id, {
        action,
        adminFeedback: feedback.trim() || undefined,
      });
      const updated = await getSiteUser(user.id);
      setUser(updated);
      setFeedback('');
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to review verification');
    } finally {
      setSubmitting(false);
    }
  }

  async function handleDocReview(doc: VerificationDocument, action: 'approve' | 'reject') {
    if (!user?.verification?.id) return;
    setSubmitting(true);
    setActionError('');
    try {
      await reviewDocument(user.verification.id, doc.id, {
        action,
        adminComment: docComments[doc.id]?.trim() || undefined,
      });
      const updated = await getSiteUser(user.id);
      setUser(updated);
      setDocComments((prev) => ({ ...prev, [doc.id]: '' }));
    } catch (err) {
      setActionError(err instanceof Error ? err.message : 'Failed to review document');
    } finally {
      setSubmitting(false);
    }
  }

  return {
    user,
    loading,
    error,
    actionError,
    editing,
    editForm,
    setEditForm,
    saving,
    feedback,
    setFeedback,
    docComments,
    setDocComments,
    submitting,
    reload: load,
    startEdit,
    cancelEdit,
    saveEdit,
    handleReview,
    handleDocReview,
  };
}
