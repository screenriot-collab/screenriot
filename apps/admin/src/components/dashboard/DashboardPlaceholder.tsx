interface DashboardPlaceholderProps {
  title: string;
}

/** Section shown when chart/data API is not available yet. */
export function DashboardPlaceholder({ title }: DashboardPlaceholderProps) {
  return (
    <section className="rounded-xl border border-white/10 bg-admin-sidebar/50 px-5 py-5">
      <h2 className="mb-3 text-base font-semibold text-white">{title}</h2>
      <p className="text-sm text-gray-500" aria-live="polite">
        Coming in upcoming updates.
      </p>
    </section>
  );
}
