import { useState } from 'react';
import type {
  CastingSuggestionRow as CastingSuggestionRowType,
  CastingSuggestionStatus,
  UpdateCastingSuggestionPayload,
} from '@/lib/api';
import { StatusPill, type StatusVariant } from '@/components/ui/StatusPill';

const STATUS_OPTIONS = [
  { value: 'pending', label: 'Pending' },
  { value: 'reviewed', label: 'Reviewed' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
];

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function suggestionStatusVariant(status: CastingSuggestionStatus): StatusVariant {
  switch (status) {
    case 'pending':
      return 'warn';
    case 'reviewed':
      return 'info';
    case 'accepted':
      return 'ok';
    case 'rejected':
      return 'bad';
    default:
      return 'neutral';
  }
}

export function CastingSuggestionRow({
  row,
  onUpdate,
}: {
  row: CastingSuggestionRowType;
  onUpdate: (
    id: string,
    payload: UpdateCastingSuggestionPayload,
  ) => Promise<{ publishedToCast: boolean }>;
}) {
  const [status, setStatus] = useState<CastingSuggestionStatus>(row.status);
  const [actorName, setActorName] = useState(row.actorName);
  const [roleHint, setRoleHint] = useState(row.roleHint ?? '');
  const [adminNote, setAdminNote] = useState(row.adminNote ?? '');
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [saveMessage, setSaveMessage] = useState<string | null>(null);

  const isAccepting = status === 'accepted';
  const canSave =
    actorName.trim().length > 0 && (!isAccepting || adminNote.trim().length > 0);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    if (!canSave) {
      if (isAccepting && !adminNote.trim()) {
        setSaveError('Admin note is required when accepting.');
      } else if (!actorName.trim()) {
        setSaveError('Actor name is required.');
      }
      return;
    }

    setSaving(true);
    setSaveError(null);
    setSaveMessage(null);
    try {
      const result = await onUpdate(row.id, {
        status,
        actorName: actorName.trim(),
        roleHint: roleHint.trim() || undefined,
        adminNote: adminNote.trim() || undefined,
      });
      if (result.publishedToCast) {
        setSaveMessage('Saved. Actor added to Dream cast on the public film page.');
      } else {
        setSaveMessage('Saved.');
      }
    } catch (err) {
      setSaveError(err instanceof Error ? err.message : 'Failed to update');
    } finally {
      setSaving(false);
    }
  }

  return (
    <tr className="align-top hover:bg-white/[0.02]">
      <td className="px-4 py-4 text-gray-300">{row.userEmail}</td>
      <td className="whitespace-nowrap px-4 py-4 text-gray-400">{formatDate(row.createdAt)}</td>
      <td className="min-w-[280px] px-4 py-4">
        <StatusPill label={row.status} variant={suggestionStatusVariant(row.status)} />
        <form onSubmit={(e) => void handleSave(e)} className="mt-3 space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <label className="flex flex-col gap-1 text-xs text-gray-400">
              Actor name
              <input
                type="text"
                value={actorName}
                onChange={(e) => setActorName(e.target.value)}
                maxLength={120}
                required
                className="rounded-md border border-white/10 bg-admin-bg px-2 py-1.5 text-sm text-white focus:border-admin-accent/60 focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
              />
            </label>
            <label className="flex flex-col gap-1 text-xs text-gray-400">
              Role
              <input
                type="text"
                value={roleHint}
                onChange={(e) => setRoleHint(e.target.value)}
                maxLength={120}
                placeholder="Optional"
                className="rounded-md border border-white/10 bg-admin-bg px-2 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-admin-accent/60 focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
              />
            </label>
          </div>

          <label className="flex flex-col gap-1 text-xs text-gray-400">
            Status
            <select
              value={status}
              onChange={(e) => {
                setStatus(e.target.value as CastingSuggestionStatus);
                setSaveError(null);
                setSaveMessage(null);
              }}
              className="rounded-md border border-white/10 bg-admin-bg px-2 py-1.5 text-sm text-white focus:border-admin-accent/60 focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
            >
              {STATUS_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
          </label>

          {isAccepting ? (
            <p className="text-xs text-emerald-300/90">
              Accepting publishes this actor to Dream cast on the public film page. Admin note is
              required.
            </p>
          ) : null}

          <label className="flex flex-col gap-1 text-xs text-gray-400">
            Admin note{isAccepting ? ' (required for Accept)' : ' (optional)'}
            <textarea
              value={adminNote}
              onChange={(e) => setAdminNote(e.target.value)}
              rows={2}
              maxLength={500}
              required={isAccepting}
              placeholder={
                isAccepting
                  ? 'Why accepted, internal context for the team…'
                  : 'Optional internal note'
              }
              className="rounded-md border border-white/10 bg-admin-bg px-2 py-1.5 text-sm text-white placeholder:text-gray-500 focus:border-admin-accent/60 focus:outline-none focus:ring-1 focus:ring-admin-accent/30"
            />
          </label>

          <button
            type="submit"
            disabled={saving || !canSave}
            className="rounded-md bg-admin-accent px-3 py-1.5 text-sm font-medium text-white hover:bg-admin-accent/90 disabled:opacity-50"
          >
            {saving ? 'Saving…' : 'Save'}
          </button>

          {saveMessage ? (
            <p className="text-xs text-emerald-400" role="status">
              {saveMessage}
            </p>
          ) : null}
          {saveError ? (
            <p className="text-xs text-red-400" role="alert">
              {saveError}
            </p>
          ) : null}
        </form>
      </td>
    </tr>
  );
}
