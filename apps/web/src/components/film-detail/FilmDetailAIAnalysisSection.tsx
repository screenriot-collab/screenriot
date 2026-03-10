import type { FilmDetailMock } from '@/markup/film-detail';
import { FilmDetailMetricCard } from './FilmDetailMetricCard';

interface FilmDetailAIAnalysisSectionProps {
  data: FilmDetailMock['aiAnalysis'];
}

export function FilmDetailAIAnalysisSection({ data }: FilmDetailAIAnalysisSectionProps) {
  return (
    <section
      className="rounded-xl p-6"
      style={{ backgroundColor: 'rgba(180, 160, 120, 0.12)' }}
      aria-labelledby="ai-analysis-heading"
    >
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h2 id="ai-analysis-heading" className="text-lg font-semibold text-white">
            AI Market Analysis
          </h2>
          <p className="mt-0.5 text-sm text-gray-400">
            Comprehensive data-driven insights to inform your investment decision
          </p>
        </div>
        <div className="rounded-lg bg-screenriot-bg px-4 py-2">
          <span className="text-sm font-medium text-gray-400">Overall Score: </span>
          <span className="text-lg font-bold text-white">
            {data.overallScore}/{data.maxScore}
          </span>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Market Insights</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.marketInsights.map((m) => (
            <FilmDetailMetricCard key={m.id} metric={m} />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Team & Talent</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          {data.teamTalent.map((m) => (
            <FilmDetailMetricCard key={m.id} metric={m} />
          ))}
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold uppercase tracking-wide text-gray-400">Investment & Success Metrics</h3>
        <div className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {data.investmentMetrics.map((m) => (
            <FilmDetailMetricCard key={m.id} metric={m} />
          ))}
        </div>
      </div>
    </section>
  );
}
