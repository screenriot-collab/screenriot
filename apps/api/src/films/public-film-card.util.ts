const DEFAULT_PLEDGE_CATEGORY_IDS = ['story', 'script', 'casting'];

type PledgeVoteRow = { scores: unknown };

function pledgeCategoryIds(pageContent: unknown): string[] {
  const pc = pageContent as Record<string, unknown> | null | undefined;
  const pledgeVoting = pc?.pledgeVoting as { categories?: { id?: string }[] } | undefined;
  const fromPage = pledgeVoting?.categories
    ?.map((c) => (c.id ?? '').trim())
    .filter(Boolean);
  return fromPage && fromPage.length > 0 ? fromPage : DEFAULT_PLEDGE_CATEGORY_IDS;
}

/** Average of per-category pledge vote means (0–10), matching detail page logic. */
export function computePledgeCommunityAverage(
  pageContent: unknown,
  votes: PledgeVoteRow[],
): number | undefined {
  if (votes.length === 0) return undefined;
  const categoryIds = pledgeCategoryIds(pageContent);
  const sums: Record<string, number> = {};
  const counts: Record<string, number> = {};
  for (const id of categoryIds) {
    sums[id] = 0;
    counts[id] = 0;
  }
  for (const row of votes) {
    const scores = row.scores as Record<string, number>;
    for (const id of categoryIds) {
      const v = typeof scores[id] === 'number' && !Number.isNaN(scores[id]) ? scores[id]! : 0;
      if (v > 0) {
        sums[id] += v;
        counts[id] += 1;
      }
    }
  }
  const categoryAverages: number[] = [];
  for (const id of categoryIds) {
    const n = counts[id] ?? 0;
    if (n > 0) {
      categoryAverages.push(Math.round((sums[id]! / n) * 10) / 10);
    }
  }
  if (categoryAverages.length === 0) return undefined;
  const avg =
    categoryAverages.reduce((a, b) => a + b, 0) / categoryAverages.length;
  return Math.round(avg * 10) / 10;
}

export function extractCardAiExtras(pageContent: unknown): {
  aiMarketScore?: number;
  predictedROI?: string;
} {
  const pc = pageContent as Record<string, unknown> | null | undefined;
  if (!pc || typeof pc !== 'object') return {};
  const ai = pc.aiAnalysis as
    | {
        overallScore?: number;
        investmentMetrics?: { label?: string; value?: string }[];
      }
    | undefined;
  if (!ai) return {};
  const score = ai.overallScore;
  const aiMarketScore =
    typeof score === 'number' && Number.isFinite(score) ? score : undefined;
  const roiMetric = ai.investmentMetrics?.find(
    (m) => m.label?.toLowerCase() === 'expected return',
  );
  const predictedROI =
    typeof roiMetric?.value === 'string' && roiMetric.value.trim()
      ? roiMetric.value.trim()
      : undefined;
  return { aiMarketScore, predictedROI };
}

export type ScreenplayScoreContent = {
  aiOverall?: number;
  expertOverall?: number;
  categories?: { name?: string; aiScore?: number; expertScore?: number }[];
};

export function hasScreenplayScoreData(pageContent: unknown): boolean {
  const pc = pageContent as Record<string, unknown> | null | undefined;
  const sc = pc?.screenplayScore as ScreenplayScoreContent | undefined;
  if (!sc || typeof sc !== 'object') return false;
  if (typeof sc.aiOverall === 'number' && Number.isFinite(sc.aiOverall) && sc.aiOverall > 0) {
    return true;
  }
  if (
    typeof sc.expertOverall === 'number' &&
    Number.isFinite(sc.expertOverall) &&
    sc.expertOverall > 0
  ) {
    return true;
  }
  return (
    Array.isArray(sc.categories) &&
    sc.categories.some(
      (c) =>
        (typeof c.aiScore === 'number' && c.aiScore > 0) ||
        (typeof c.expertScore === 'number' && c.expertScore > 0),
    )
  );
}

export function hasAiMarketAnalysis(pageContent: unknown): boolean {
  const { aiMarketScore } = extractCardAiExtras(pageContent);
  if (aiMarketScore != null) return true;
  const pc = pageContent as Record<string, unknown> | null | undefined;
  const ai = pc?.aiAnalysis as Record<string, unknown> | undefined;
  if (!ai || typeof ai !== 'object') return false;
  for (const key of ['marketInsights', 'teamTalent', 'investmentMetrics'] as const) {
    if (Array.isArray(ai[key]) && ai[key].length > 0) return true;
  }
  return false;
}

export function resolveCardCommunityScore(
  cachedAverageScore: unknown,
  pageContent: unknown,
  pledgeVotes: PledgeVoteRow[],
): number | undefined {
  if (cachedAverageScore != null) {
    const n = Number(cachedAverageScore);
    if (Number.isFinite(n)) return n;
  }
  const pc = pageContent as Record<string, unknown> | null | undefined;
  const sidebar = pc?.sidebar as { averageScore?: number } | undefined;
  if (typeof sidebar?.averageScore === 'number' && Number.isFinite(sidebar.averageScore)) {
    return sidebar.averageScore;
  }
  return computePledgeCommunityAverage(pageContent, pledgeVotes);
}
