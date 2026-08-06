'use client';

import { useState } from 'react';
import type { KeyCrewMemberMock } from '@/markup/film-detail';

const DESCRIPTION_PREVIEW_LEN = 120;

interface FilmDetailKeyCrewSectionProps {
  crew: KeyCrewMemberMock[];
}

function initials(name: string): string {
  return (
    name.trim().split(/\s+/).filter(Boolean).map((n) => n[0]).join('').toUpperCase() || '?'
  );
}

export function FilmDetailKeyCrewSection({ crew }: FilmDetailKeyCrewSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [expandedDesc, setExpandedDesc] = useState<Record<string, boolean>>({});

  return (
    <section className="rounded-xl border border-white/10 bg-screenriot-bg-card" aria-labelledby="key-crew-heading">
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 id="key-crew-heading" className="text-lg font-semibold text-white">
          Key Crew
        </h2>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
          aria-expanded={expanded}
          aria-controls="key-crew-content"
          aria-label={expanded ? 'Collapse Key Crew' : 'Expand Key Crew'}
        >
          <svg
            className={`h-5 w-5 transition-transform ${expanded ? 'rotate-180' : ''}`}
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={2}
            stroke="currentColor"
            aria-hidden
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
          </svg>
        </button>
      </div>
      {expanded && (
      <div id="key-crew-content" className="px-6 py-4">
        <div className="flex flex-wrap gap-4">
          {crew.map((member) => {
            const desc = member.description?.trim() ?? '';
            const isExpanded = expandedDesc[member.id] ?? false;
            const showToggle = desc.length > DESCRIPTION_PREVIEW_LEN;
            const preview =
              showToggle && !isExpanded
                ? `${desc.slice(0, DESCRIPTION_PREVIEW_LEN).trim()}${desc.length > DESCRIPTION_PREVIEW_LEN ? '…' : ''}`
                : desc;
            return (
              <div
                key={member.id}
                className="min-w-[200px] max-w-[220px] flex-1 rounded-xl border border-white/10 bg-white/[0.06] p-5"
              >
                <div className="flex flex-col items-center text-center">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-2xl font-bold text-white">
                    {member.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={member.imageUrl} alt="" className="h-full w-full object-cover" aria-hidden />
                    ) : (
                      initials(member.name)
                    )}
                  </div>
                  <p className="mt-3 font-semibold text-white">{member.name}</p>
                  <p className="mt-0.5 text-xs text-gray-400">{member.role}</p>
                  {desc ? (
                    <p className="mt-3 text-left text-sm leading-relaxed text-gray-400">{preview}</p>
                  ) : (
                    <p className="mt-3 text-left text-sm italic text-gray-500">No description</p>
                  )}
                  {desc && showToggle && (
                    <button
                      type="button"
                      onClick={() => setExpandedDesc((prev) => ({ ...prev, [member.id]: !prev[member.id] }))}
                      className="mt-2 text-sm font-medium text-screenriot-accent-blue hover:underline"
                    >
                      {isExpanded ? 'Show less' : 'Read more'}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      )}
    </section>
  );
}
