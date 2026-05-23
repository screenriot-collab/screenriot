'use client';

import { useState } from 'react';
import type { TreatmentMock, CharacterMock } from '@/markup/film-detail';
import { ProposeEditPencil } from '@/components/film-propose/ProposeEditPencil';

const DESCRIPTION_PREVIEW_LEN = 120;

interface FilmDetailStoryCharactersSectionProps {
  treatment: TreatmentMock;
  characters: CharacterMock[];
}

export function FilmDetailStoryCharactersSection({ treatment, characters }: FilmDetailStoryCharactersSectionProps) {
  const [expanded, setExpanded] = useState(true);
  const [expandedDesc, setExpandedDesc] = useState<Record<string, boolean>>({});

  return (
    <section
      className="rounded-xl border border-white/10 bg-screenriot-bg-card"
      aria-labelledby="story-characters-heading"
    >
      <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
        <h2 id="story-characters-heading" className="text-lg font-semibold text-white">
          Story & Characters
        </h2>
        <button
          type="button"
          onClick={() => setExpanded(!expanded)}
          className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
          aria-expanded={expanded}
          aria-controls="story-characters-content"
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

      <div id="story-characters-content" className="px-6 py-4">
        {expanded && (
          <>
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Treatment</h3>
                <ProposeEditPencil
                  target={{
                    path: 'pageContent.treatment.act1',
                    label: 'Treatment (Act 1)',
                    oldValue: treatment.act1 ?? '',
                  }}
                />
              </div>
              <div className="mt-3 max-h-64 overflow-y-auto rounded-lg border border-white/10 bg-white/[0.02] p-4">
                <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-300">
                  {treatment.act1}
                </pre>
                <pre className="mt-4 whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-300">
                  {treatment.act2}
                </pre>
              </div>
            </div>

            <div className="mt-8">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Main Characters</h3>
              <div className="mt-4 flex gap-4 overflow-x-auto pb-3">
                {characters.map((c) => {
                  const desc = c.description?.trim() ?? '';
                  const isExpanded = expandedDesc[c.id] ?? false;
                  const showToggle = desc.length > DESCRIPTION_PREVIEW_LEN;
                  const preview =
                    showToggle && !isExpanded
                      ? `${desc.slice(0, DESCRIPTION_PREVIEW_LEN).trim()}${desc.length > DESCRIPTION_PREVIEW_LEN ? '…' : ''}`
                      : desc;
                  return (
                    <div
                      key={c.id}
                      className="min-w-[260px] max-w-[280px] shrink-0 rounded-xl border border-white/10 bg-white/[0.06] p-5"
                    >
                      <div className="flex flex-col items-center text-center">
                        <div className="flex h-20 w-20 shrink-0 items-center justify-center overflow-hidden rounded-full bg-white/10 text-2xl font-bold text-white">
                          {c.imageUrl ? (
                            /* eslint-disable-next-line @next/next/no-img-element */
                            <img src={c.imageUrl} alt="" className="h-full w-full object-cover" aria-hidden />
                          ) : (
                            (c.name
                              .trim()
                              .split(/\s+/)
                              .filter(Boolean)
                              .map((n) => n[0])
                              .join('')
                              .toUpperCase() || '?')
                          )}
                        </div>
                        <p className="mt-3 font-semibold text-white">{c.name}</p>
                        <p className="mt-0.5 text-xs text-gray-400">{c.role}</p>
                        <div className="mt-3 flex w-full items-start justify-between gap-2">
                          {desc ? (
                            <p className="min-w-0 flex-1 text-left text-sm leading-relaxed text-gray-400">
                              {preview}
                            </p>
                          ) : (
                            <p className="min-w-0 flex-1 text-left text-sm italic text-gray-500">
                              No description
                            </p>
                          )}
                          <ProposeEditPencil
                            target={{
                              path: `pageContent.mainCharacters.${c.id}.description`,
                              label: `Main Characters — ${c.name} — Description`,
                              oldValue: desc,
                            }}
                            className="shrink-0"
                          />
                        </div>
                        {desc && showToggle && (
                          <button
                            type="button"
                            onClick={() =>
                              setExpandedDesc((prev) => ({ ...prev, [c.id]: !prev[c.id] }))
                            }
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
          </>
        )}
      </div>
    </section>
  );
}
