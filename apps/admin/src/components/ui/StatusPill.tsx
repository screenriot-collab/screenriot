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

// Full class strings, not built from interpolated pieces: Tailwind's JIT scanner
// only picks up arbitrary-value classes that appear literally in source.
const VARIANT_ACCENT_CLASS: Record<StatusVariant, string> = {
  neutral: 'shadow-[inset_3px_0_0_0_#ffffff33]',
  warn: 'shadow-[inset_3px_0_0_0_#f59e0b]',
  ok: 'shadow-[inset_3px_0_0_0_#10b981]',
  bad: 'shadow-[inset_3px_0_0_0_#ef4444]',
  info: 'shadow-[inset_3px_0_0_0_#0ea5e9]',
  purple: 'shadow-[inset_3px_0_0_0_#8b5cf6]',
};

/**
 * 3px left accent, matching the StatusPill variant. Apply to the row's
 * first `<td>`, not the `<tr>` itself — box-shadow on a table-row element
 * isn't reliably clipped to its own box in browsers, and can visually
 * bleed over the row's `border-b` divider at the left corner.
 */
export function statusAccentClass(variant: StatusVariant): string {
  return VARIANT_ACCENT_CLASS[variant];
}

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

/** Same bg/text color pair as StatusPill, for reuse outside the pill shape (e.g. active tab state). */
export function statusBadgeClass(variant: StatusVariant): string {
  return VARIANT_CLASS[variant];
}

const VARIANT_TEXT_CLASS: Record<StatusVariant, string> = {
  neutral: 'text-gray-400',
  warn: 'text-amber-400/80',
  ok: 'text-emerald-400/80',
  bad: 'text-red-400/80',
  info: 'text-sky-400/80',
  purple: 'text-violet-400/80',
};

/** Text-only color for a variant, dimmed — for labels that should hint their status before being selected/activated. */
export function statusTextClass(variant: StatusVariant): string {
  return VARIANT_TEXT_CLASS[variant];
}

export function StatusPill({ label, variant }: { label: string; variant: StatusVariant }) {
  return (
    <span className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${VARIANT_CLASS[variant]}`}>
      {label}
    </span>
  );
}
