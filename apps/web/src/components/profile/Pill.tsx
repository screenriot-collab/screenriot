'use client';

type PillProps = {
  children: React.ReactNode;
  icon?: React.ReactNode;
};

const PILL_CLASS =
  'inline-flex items-center gap-1 rounded-full bg-screenriot-accent-blue/20 px-3 py-1 text-sm text-white';

export function Pill({ children, icon }: PillProps) {
  return (
    <span className={PILL_CLASS}>
      {icon}
      {children}
    </span>
  );
}
