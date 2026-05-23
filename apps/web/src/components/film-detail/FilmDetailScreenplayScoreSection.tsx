'use client';

import { useState, type ReactNode } from 'react';
import type { ScreenplayScoreMock } from '@/markup/film-detail';

interface FilmDetailScreenplayScoreSectionProps {
  data: ScreenplayScoreMock;
}

function ScoreBar({
  label,
  value,
  max,
  gradientClass,
  icon,
}: {
  label: string;
  value: number;
  max: number;
  gradientClass: string;
  icon: ReactNode;
}) {
  const pct = max > 0 ? Math.min(100, Math.round((value / max) * 100)) : 0;
  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <div className="flex items-center gap-2 text-sm font-medium text-white/90">
          {icon}
          {label}
        </div>
        <span className="text-xl font-bold text-white">
          {value}/{max}
        </span>
      </div>
      <div className="h-3 overflow-hidden rounded-full bg-black/20">
        <div
          className={`h-full rounded-full transition-all duration-700 ease-out ${gradientClass}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function FilmDetailScreenplayScoreSection({ data }: FilmDetailScreenplayScoreSectionProps) {
  const [expanded, setExpanded] = useState(false);
  const showAi = data.aiOverall > 0;
  const showExpert = data.expertOverall > 0;
  const categories = data.categories.filter(
    (c) => c.aiScore > 0 || c.expertScore > 0,
  );

  if (!showAi && !showExpert && categories.length === 0) {
    return null;
  }

  return (
    <section
      className="rounded-xl border border-screenriot-accent-blue/30 bg-gradient-to-br from-screenriot-accent-blue/20 to-blue-600/20 p-6 backdrop-blur-sm"
      aria-labelledby="screenplay-score-heading"
    >
      <div className="mb-6">
        <h2
          id="screenplay-score-heading"
          className="flex items-center gap-2 text-lg font-semibold text-white"
        >
          <svg className="h-5 w-5 text-screenriot-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
            <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z" />
          </svg>
          Screenplay Score
        </h2>
        <p className="mt-1 text-sm text-white/80">
          AI-powered and expert analysis of script quality
        </p>
      </div>

      <div className="space-y-4">
        {showAi ? (
          <ScoreBar
            label="AI Screenplay Score"
            value={data.aiOverall}
            max={100}
            gradientClass="bg-gradient-to-r from-purple-400 to-purple-600"
            icon={
              <svg className="h-4 w-4 text-purple-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
              </svg>
            }
          />
        ) : null}
        {showExpert ? (
          <ScoreBar
            label="Expert Score"
            value={data.expertOverall}
            max={100}
            gradientClass="bg-gradient-to-r from-yellow-400 to-yellow-600"
            icon={
              <svg className="h-4 w-4 text-screenriot-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172M9.497 14.25a7.454 7.454 0 0 0 .981-3.172M5.25 4.236c-.982.143-1.954.317-2.916.52A6.003 6.003 0 0 0 7.73 9.728M5.25 4.236V4.5c0 2.108.966 3.99 2.48 5.228M5.25 4.236V2.721C7.456 2.41 9.71 2.25 12 2.25c2.291 0 4.545.16 6.75.47v1.516M18.75 4.236c.982.143 1.954.317 2.916.52a6.003 6.003 0 0 1-5.395 4.272m0 0a7.454 7.454 0 0 0 .98 3.172m0 0 .001.228a3.3 3.3 0 0 0 3.3 3.3c.645 0 1.262-.194 1.787-.53" />
              </svg>
            }
          />
        ) : null}
      </div>

      {categories.length > 0 ? (
        <>
          <button
            type="button"
            onClick={() => setExpanded((e) => !e)}
            className="mt-6 flex w-full items-center justify-center gap-2 rounded-lg border border-white/20 bg-white/10 py-2.5 text-sm font-medium text-white transition-colors hover:bg-white/20"
            aria-expanded={expanded}
          >
            See Full Script Score
            <svg
              className={`h-4 w-4 transition-transform ${expanded ? 'rotate-180' : ''}`}
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              aria-hidden
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="m19.5 8.25-7.5 7.5-7.5-7.5" />
            </svg>
          </button>
          {expanded ? (
            <div className="mt-6 space-y-5 border-t border-white/20 pt-6">
              {categories.map((category) => (
                <div key={category.name} className="space-y-3">
                  <h4 className="font-medium text-white">{category.name}</h4>
                  {category.aiScore > 0 ? (
                    <ScoreBar
                      label="AI"
                      value={category.aiScore}
                      max={100}
                      gradientClass="bg-gradient-to-r from-purple-400 to-purple-600"
                      icon={
                        <svg className="h-3 w-3 text-purple-300" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09Z" />
                        </svg>
                      }
                    />
                  ) : null}
                  {category.expertScore > 0 ? (
                    <ScoreBar
                      label="Expert"
                      value={category.expertScore}
                      max={100}
                      gradientClass="bg-gradient-to-r from-yellow-400 to-yellow-600"
                      icon={
                        <svg className="h-3 w-3 text-screenriot-accent" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.5 18.75h-9m9 0a3 3 0 0 1 3 3h-15a3 3 0 0 1 3-3m9 0v-3.375c0-.621-.503-1.125-1.125-1.125h-.871M7.5 18.75v-3.375c0-.621.504-1.125 1.125-1.125h.872m5.007 0H9.497m5.007 0a7.454 7.454 0 0 1-.982-3.172" />
                        </svg>
                      }
                    />
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </>
      ) : null}
    </section>
  );
}
