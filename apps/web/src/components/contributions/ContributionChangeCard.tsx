import { normalizeContributionPatches } from '@/lib/contribution-patches';

interface ContributionChangeCardProps {
  changes: unknown;
  comment?: string;
  adminComment?: string;
  status: string;
}

export function ContributionChangeCard({
  changes,
  comment,
  adminComment,
  status,
}: ContributionChangeCardProps) {
  const patches = normalizeContributionPatches(changes);

  return (
    <div className="mt-4 space-y-4">
      <h3 className="text-sm font-medium text-gray-300">What you asked to change</h3>
      {patches.length === 0 ? (
        <p className="text-sm text-screenriot-muted">No changes to display.</p>
      ) : (
        <div className="space-y-3">
          {patches.map((patch) => (
            <div
              key={`${patch.path}-${patch.label}`}
              className="rounded-lg border border-white/10 bg-white/[0.03] p-4"
            >
              <p className="text-sm font-medium text-white">{patch.label}</p>
              {patch.oldValue ? (
                <p className="mt-2 text-sm text-gray-500 line-through">{patch.oldValue}</p>
              ) : null}
              <p className="mt-2 whitespace-pre-wrap text-sm text-gray-200">{patch.newValue}</p>
            </div>
          ))}
        </div>
      )}

      {comment && (
        <div className="rounded-lg border border-white/10 bg-white/[0.03] p-3">
          <p className="text-xs font-medium text-gray-400">Your reason</p>
          <p className="mt-1 text-sm italic text-gray-300">&ldquo;{comment}&rdquo;</p>
        </div>
      )}

      {status === 'rejected' && adminComment && (
        <div className="rounded-lg bg-red-500/10 p-3">
          <p className="text-xs font-medium uppercase tracking-wider text-red-400">Moderator note</p>
          <p className="mt-1 text-sm text-red-300">{adminComment}</p>
        </div>
      )}
    </div>
  );
}
