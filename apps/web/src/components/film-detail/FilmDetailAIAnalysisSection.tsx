'use client';

import { useState, type ReactNode } from 'react';
import type { FilmDetailMock, SimilarFilm } from '@/markup/film-detail';
import { FilmDetailMetricCard } from './FilmDetailMetricCard';
import { FilmDetailSimilarCard } from './FilmDetailSimilarCard';

interface FilmDetailAIAnalysisSectionProps {
  data: FilmDetailMock['aiAnalysis'];
  hasAiMarketScore: boolean;
  similarFilms?: SimilarFilm[];
}

function SectionHeading({ children }: { children: ReactNode }) {
  return (
    <h3 className="mb-3 flex items-center gap-2 text-base font-semibold text-screenriot-accent">
      {children}
    </h3>
  );
}

export function FilmDetailAIAnalysisSection({
  data,
  hasAiMarketScore,
  similarFilms = [],
}: FilmDetailAIAnalysisSectionProps) {
  const [expanded, setExpanded] = useState(true);

  if (!hasAiMarketScore) {
    return (
      <section
        className="rounded-xl border border-white/10 bg-screenriot-bg-card p-6"
        aria-labelledby="ai-analysis-heading"
      >
        <h2 id="ai-analysis-heading" className="text-lg font-semibold text-white">
          AI Market Analysis
        </h2>
        <p className="mt-2 text-sm text-screenriot-muted">
          Analysis will appear here once the project has been scored.
        </p>
      </section>
    );
  }

  const showOverall = data.overallScore > 0;

  return (
    <section
      className="rounded-xl border border-screenriot-accent/20 bg-gradient-to-br from-[#1a1410]/95 to-[#2a1f15]/95 p-6 backdrop-blur-sm"
      aria-labelledby="ai-analysis-heading"
    >
      <div className="flex flex-nowrap items-center justify-between gap-4">
        <h2
          id="ai-analysis-heading"
          className="flex min-w-0 items-center gap-2 text-xl font-semibold text-screenriot-accent"
        >
          <svg className="h-6 w-6 shrink-0" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
            />
          </svg>
          AI Market Analysis
        </h2>
        <div className="flex shrink-0 items-center gap-3">
          {showOverall ? (
            <span className="whitespace-nowrap rounded-md border border-screenriot-accent/40 bg-screenriot-accent/90 px-3 py-1 text-base font-semibold text-black">
              Overall Score: {data.overallScore}/{data.maxScore}
            </span>
          ) : null}
          <button
            type="button"
            onClick={() => setExpanded(!expanded)}
            className="rounded p-1.5 text-gray-400 hover:bg-white/10 hover:text-white"
            aria-expanded={expanded}
            aria-controls="ai-analysis-content"
            aria-label={expanded ? 'Collapse AI Market Analysis' : 'Expand AI Market Analysis'}
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
      </div>
      <p className="mt-3 text-base text-gray-300">
        Comprehensive data-driven insights to inform your investment decision
      </p>

      {expanded && (
        <div id="ai-analysis-content">
          {data.marketInsights.length > 0 ? (
            <div className="mt-6">
              <SectionHeading>Market Insights</SectionHeading>
              <div className="grid gap-3 md:grid-cols-3">
                {data.marketInsights.map((m) => (
                  <FilmDetailMetricCard key={m.id} metric={m} />
                ))}
              </div>
            </div>
          ) : null}

          {data.teamTalent.length > 0 ? (
            <div className="mt-6">
              <SectionHeading>Team & Talent</SectionHeading>
              <div className="grid gap-3 md:grid-cols-3">
                {data.teamTalent.map((m) => (
                  <FilmDetailMetricCard key={m.id} metric={m} />
                ))}
              </div>
            </div>
          ) : null}

          {data.investmentMetrics.length > 0 ? (
            <div className="mt-6">
              <SectionHeading>Investment & Success Metrics</SectionHeading>
              <div className="grid gap-3 md:grid-cols-3">
                {data.investmentMetrics.map((m) => (
                  <FilmDetailMetricCard key={m.id} metric={m} />
                ))}
              </div>
            </div>
          ) : null}

          {similarFilms.length > 0 ? (
            <div className="mt-6 border-t border-screenriot-accent/20 pt-6">
              <SectionHeading>Similar Successful Films</SectionHeading>
              <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
                {similarFilms.map((f) => (
                  <FilmDetailSimilarCard key={f.id} film={f} />
                ))}
              </div>
            </div>
          ) : null}
        </div>
      )}
    </section>
  );
}
