'use client';

import { useEffect, useState } from 'react';

export type ProposeFieldTarget = {
  path: string;
  label: string;
  oldValue: string;
};

interface ProposeChangeModalProps {
  target: ProposeFieldTarget | null;
  onClose: () => void;
  onSubmit: (newValue: string, reason: string) => Promise<void>;
}

export function ProposeChangeModal({ target, onClose, onSubmit }: ProposeChangeModalProps) {
  const [newValue, setNewValue] = useState('');
  const [reason, setReason] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (target) {
      setNewValue(target.oldValue);
      setReason('');
      setError('');
    }
  }, [target]);

  if (!target) {
    return null;
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!newValue.trim()) {
      setError('Please enter the new text.');
      return;
    }
    if (!reason.trim()) {
      setError('Please explain why you want this change.');
      return;
    }
    setLoading(true);
    setError('');
    try {
      await onSubmit(newValue.trim(), reason.trim());
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to submit change request.');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="propose-change-title"
    >
      <div className="max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-xl border border-white/10 bg-screenriot-bg-card p-6 shadow-xl">
        <div className="flex items-start justify-between gap-3">
          <h2 id="propose-change-title" className="text-lg font-semibold text-white">
            Propose change
          </h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-white/10 hover:text-white"
            aria-label="Close"
          >
            ✕
          </button>
        </div>
        <p className="mt-1 text-sm text-screenriot-muted">{target.label}</p>

        <form onSubmit={handleSubmit} className="mt-5 space-y-4">
          <div>
            <label className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500">
              Current (published)
            </label>
            <div className="max-h-32 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.03] p-3 text-sm text-gray-400 line-through decoration-red-500/60">
              {target.oldValue || '—'}
            </div>
          </div>

          <div>
            <label htmlFor="propose-new-value" className="mb-1 block text-xs font-medium text-gray-300">
              New text
            </label>
            <textarea
              id="propose-new-value"
              rows={5}
              value={newValue}
              onChange={(e) => setNewValue(e.target.value)}
              className="block w-full rounded-lg border border-white/20 bg-screenriot-bg px-3 py-2 text-sm text-white focus:border-screenriot-accent-blue focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue"
            />
          </div>

          <div>
            <label htmlFor="propose-reason" className="mb-1 block text-xs font-medium text-gray-300">
              Reason for the change
            </label>
            <textarea
              id="propose-reason"
              rows={3}
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Why should this be updated?"
              className="block w-full rounded-lg border border-white/20 bg-screenriot-bg px-3 py-2 text-sm text-white placeholder:text-screenriot-muted focus:border-screenriot-accent-blue focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue"
            />
          </div>

          {error && (
            <p className="text-sm text-red-400" role="alert">
              {error}
            </p>
          )}

          <div className="flex justify-end gap-2 pt-2">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="rounded-lg border border-white/20 px-4 py-2 text-sm text-white hover:bg-white/10 disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="rounded-lg bg-screenriot-accent-blue px-4 py-2 text-sm font-medium text-white hover:bg-screenriot-accent-blue/90 disabled:opacity-50"
            >
              {loading ? 'Submitting…' : 'Submit for review'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
