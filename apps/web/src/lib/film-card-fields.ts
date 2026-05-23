/**
 * Public film card metrics: UI is implemented; each field maps to a backend source.
 * FilmCard shows 0 / placeholder when `has*` is false (see ApiPublicFilmCard).
 *
 * Canonical checklist: docs/API_UI_PENDING.md
 * Rule: .cursor/rules/api-ui-contract.mdc
 */

export type FilmCardMetricKey = 'communityScore' | 'aiMarketScore' | 'predictedRoi';

export const FILM_CARD_METRICS: Record<
  FilmCardMetricKey,
  { label: string; backendSource: string }
> = {
  communityScore: {
    label: 'Community score',
    backendSource:
      'GET /films/public → rating (cachedAverageScore | pledge vote average | pageContent.sidebar.averageScore)',
  },
  aiMarketScore: {
    label: 'AI market score',
    backendSource: 'GET /films/public → aiMarketScore (pageContent.aiAnalysis.overallScore)',
  },
  predictedRoi: {
    label: 'Predicted ROI',
    backendSource:
      'GET /films/public → predictedROI (pageContent.aiAnalysis.investmentMetrics, label Expected Return)',
  },
};

export function filmCardPendingHint(key: FilmCardMetricKey): string {
  const m = FILM_CARD_METRICS[key];
  return `${m.label}: UI ready, awaiting backend data. Expected: ${m.backendSource}`;
}
