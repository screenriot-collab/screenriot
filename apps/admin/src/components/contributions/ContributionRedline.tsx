import { normalizeContributionPatches } from '@/lib/contribution-patches';

interface ContributionRedlineProps {
  changes: unknown;
  comment?: string;
}

export function ContributionRedline({ changes, comment }: ContributionRedlineProps) {
  const patches = normalizeContributionPatches(changes);

  if (patches.length === 0) {
    return (
      <p className="text-sm text-gray-500">
        No readable changes in this request. Contact support if something looks wrong.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      {patches.map((patch) => (
        <div
          key={`${patch.path}-${patch.label}`}
          className="rounded-lg border border-white/10 bg-admin-bg/80 p-4"
        >
          <p className="text-sm font-semibold text-white">{patch.label}</p>
          <div className="mt-3 grid gap-3 lg:grid-cols-2">
            <div>
              <p className="mb-1 text-xs font-medium text-red-400/90">Currently on the site</p>
              <div className="max-h-48 overflow-y-auto rounded border border-red-500/20 bg-red-500/5 p-3">
                <p className="whitespace-pre-wrap text-sm text-gray-400 line-through decoration-red-500/50">
                  {patch.oldValue || '(empty)'}
                </p>
              </div>
            </div>
            <div>
              <p className="mb-1 text-xs font-medium text-green-400/90">Filmmaker proposes</p>
              <div className="max-h-48 overflow-y-auto rounded border border-green-500/20 bg-green-500/5 p-3">
                <p className="whitespace-pre-wrap text-sm text-gray-100">{patch.newValue}</p>
              </div>
            </div>
          </div>
        </div>
      ))}
      {comment && (
        <div className="rounded-lg border border-amber-500/20 bg-amber-500/5 p-3">
          <p className="text-xs font-medium text-amber-400/90">Why the filmmaker wants this change</p>
          <p className="mt-1 text-sm text-gray-200">&ldquo;{comment}&rdquo;</p>
        </div>
      )}
    </div>
  );
}
