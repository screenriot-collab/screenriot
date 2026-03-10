interface DashboardSectionProps {
  title: string;
  children: React.ReactNode;
}

export function DashboardSection({ title, children }: DashboardSectionProps) {
  return (
    <section
      className="rounded-xl border border-white/10 bg-admin-sidebar/50 px-5 py-5"
      aria-labelledby={`section-${title.replace(/\s+/g, '-').toLowerCase()}`}
    >
      <h2 id={`section-${title.replace(/\s+/g, '-').toLowerCase()}`} className="mb-3 text-base font-semibold text-white">
        {title}
      </h2>
      {children}
    </section>
  );
}
