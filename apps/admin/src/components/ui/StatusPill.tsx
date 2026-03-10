/* eslint-disable react-refresh/only-export-components */
export type StatusVariant = 'neutral' | 'warn' | 'ok' | 'bad' | 'info' | 'purple';

const VARIANT_CLASS: Record<StatusVariant, string> = {
  neutral: 'bg-white/10 text-gray-300',
  warn: 'bg-amber-500/20 text-amber-300',
  ok: 'bg-emerald-500/20 text-emerald-300',
  bad: 'bg-red-500/20 text-red-300',
  info: 'bg-sky-500/20 text-sky-300',
  purple: 'bg-violet-500/20 text-violet-300',
};

export function statusVariant(status: string): StatusVariant {
  switch (status) {
    case 'pending_approval':
      return 'warn';
    case 'approved':
      return 'ok';
    case 'rejected':
      return 'bad';
    default:
      return 'neutral';
  }
}

export function StatusPill({ label, variant }: { label: string; variant: StatusVariant }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASS[variant]}`}>
      {label}
    </span>
  );
}
