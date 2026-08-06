import type { ReactNode } from 'react';
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
    <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-screenriot-accent">
      {children}
    </h3>
  );
}

export function FilmDetailAIAnalysisSection({
  data,
  hasAiMarketScore,
  similarFilms = [],
}: FilmDetailAIAnalysisSectionProps) {
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
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2
            id="ai-analysis-heading"
            className="flex items-center gap-2 text-lg font-semibold text-screenriot-accent"
          >
            <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" aria-hidden>
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9.813 15.904 9 18.75l-.813-2.846a4.5 4.5 0 0 0-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 0 0 3.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 0 0 3.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 0 0-3.09 3.09ZM18.259 8.715 18 9.75l-.259-1.035a3.375 3.375 0 0 0-2.455-2.456L14.25 6l1.036-.259a3.375 3.375 0 0 0 2.455-2.456L18 2.25l.259 1.035a3.375 3.375 0 0 0 2.456 2.456L21.75 6l-1.035.259a3.375 3.375 0 0 0-2.456 2.456ZM16.894 20.567 16.5 21.75l-.394-1.183a2.25 2.25 0 0 0-1.423-1.423L13.5 18.75l1.183-.394a2.25 2.25 0 0 0 1.423-1.423l.394-1.183.394 1.183a2.25 2.25 0 0 0 1.423 1.423l1.183.394-1.183.394a2.25 2.25 0 0 0-1.423 1.423Z"
              />
            </svg>
            AI Market Analysis
          </h2>
          <p className="mt-1 text-sm text-gray-300">
            Comprehensive data-driven insights to inform your investment decision
          </p>
        </div>
        {showOverall ? (
          <span className="rounded-md border border-screenriot-accent/40 bg-screenriot-accent/90 px-3 py-1 text-sm font-semibold text-black">
            Overall Score: {data.overallScore}/{data.maxScore}
          </span>
        ) : null}
      </div>

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
    </section>
  );
}
