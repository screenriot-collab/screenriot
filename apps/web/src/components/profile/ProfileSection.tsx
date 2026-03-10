'use client';

type ProfileSectionProps = {
  id: string;
  heading: React.ReactNode;
  children: React.ReactNode;
};

const SECTION_CLASS =
  'rounded-lg border border-white/10 bg-screenriot-bg p-5';

export function ProfileSection({ id, heading, children }: ProfileSectionProps) {
  return (
    <section
      className={SECTION_CLASS}
      aria-labelledby={id}
    >
      <h2 id={id} className="text-lg font-semibold text-white">
        {heading}
      </h2>
      {children}
    </section>
  );
}
