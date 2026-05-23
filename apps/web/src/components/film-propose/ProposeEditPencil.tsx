'use client';

import type { ProposeFieldTarget } from './ProposeChangeModal';
import { useFilmProposeEdit } from './FilmProposeEditContext';

interface ProposeEditPencilProps {
  target: ProposeFieldTarget;
  className?: string;
}

export function ProposeEditPencil({ target, className = '' }: ProposeEditPencilProps) {
  const ctx = useFilmProposeEdit();
  if (!ctx?.enabled) {
    return null;
  }

  return (
    <button
      type="button"
      onClick={() => ctx.openEditor(target)}
      className={`inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-gray-300 transition-colors hover:border-screenriot-accent-blue/50 hover:bg-screenriot-accent-blue/20 hover:text-white focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue/50 ${className}`}
      aria-label={`Propose change: ${target.label}`}
      title="Propose change"
    >
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width="15"
        height="15"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden
      >
        <path d="M17 3a2.85 2.83 0 1 1 4 4L7.5 20.5 2 22l1.5-5.5Z" />
      </svg>
    </button>
  );
}
