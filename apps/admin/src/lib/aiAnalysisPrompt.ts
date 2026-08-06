import type { AdminFilm, AiAnalysisForm, MetricForm, SimilarFilmForm } from '@/types/films';

/**
 * Manual LLM-assist workflow for AI Market Analysis (MVP stand-in until a real
 * vendor is integrated): admin copies a prompt built from the film's own data,
 * runs it in whichever LLM they have access to, then pastes the JSON response
 * back in. Nothing here calls an external API - it's all local string building
 * and parsing.
 */

export type AiAnalysisDraft = {
  aiAnalysis: AiAnalysisForm;
  similarFilms: SimilarFilmForm[];
};

const RESPONSE_SHAPE_EXAMPLE = `{
  "overallScore": 88,
  "marketInsights": [
    { "label": "Popularity & Trend", "value": "87", "description": "Based on similar films' performance" },
    { "label": "Global Appeal", "value": "82", "description": "Strong international resonance" },
    { "label": "Fan Buzz", "value": "91", "description": "High social media engagement" },
    { "label": "Topicality", "value": "88", "description": "Aligns with current trends" },
    { "label": "Genre Insights", "value": "Strong", "description": "Sci-Fi Thriller trending +24% in North America, +18% internationally" }
  ],
  "teamTalent": [
    { "label": "Crew Experience", "value": "89", "description": "Proven track record in genre" },
    { "label": "Talent Draw", "value": "85", "description": "Strong cast & crew appeal" },
    { "label": "Series Potential", "value": "High", "description": "Franchise opportunity identified" }
  ],
  "investmentMetrics": [
    { "label": "Expected Return", "value": "18-24%", "description": "Conservative projection" },
    { "label": "Investment Risk", "value": "Medium", "description": "Balanced risk-reward profile" },
    { "label": "Community Interest", "value": "93", "description": "Exceptional fan enthusiasm" },
    { "label": "Festival / Awards", "value": "78", "description": "Good recognition potential" },
    { "label": "Platform Suitability", "value": "Excellent", "description": "Fits streaming platforms' runtime and format" }
  ],
  "similarFilms": [
    { "title": "Ex Machina", "boxOffice": "$36.9M", "roi": "8.5x", "rating": "92% Critical", "matchPercent": 94 },
    { "title": "Inception", "boxOffice": "$836M", "roi": "5.2x", "rating": "87% Critical", "matchPercent": 89 }
  ]
}`;

export function buildAiAnalysisPrompt(film: AdminFilm): string {
  const cast = film.step3?.cast ?? [];
  const crew = film.step3?.crew ?? [];
  const budget = film.step4?.totalBudget;
  const breakdown = film.step4?.breakdown ?? [];

  const lines: string[] = [
    'You are a film market analyst. Analyze the following independent film project and produce a structured investment analysis for potential crowd-investors.',
    '',
    `Title: ${film.title}`,
    `Genre: ${film.genre ?? '-'}`,
    `Logline: ${film.logline ?? '-'}`,
    `Synopsis: ${film.synopsis ?? '-'}`,
    `Runtime: ${film.runtime ?? '-'} minutes`,
    `Director: ${film.directorName ?? '-'}`,
  ];

  if (budget) lines.push(`Total budget: $${budget}`);
  if (breakdown.length > 0) {
    lines.push('Budget breakdown:');
    breakdown.forEach((b) => lines.push(`- ${b.label ?? '-'}: ${b.percent ?? 0}%`));
  }
  if (cast.length > 0) {
    lines.push('Cast:');
    cast.forEach((c) => lines.push(`- ${c.actorName ?? '(unnamed)'} as ${c.character ?? c.role ?? '-'}`));
  }
  if (crew.length > 0) {
    lines.push('Key crew:');
    crew.forEach((c) => lines.push(`- ${c.name ?? '(unnamed)'} (${c.position ?? '-'})`));
  }

  lines.push(
    '',
    'Rules:',
    '- Give reasonable analyst estimates, not fabricated precision - it is fine to reason from genre/budget comparables.',
    '- Each metric\'s "value" can be a 0-100 score (as a string) or a short qualitative label (e.g. "High", "Medium", "18-24%") - whichever fits that metric better.',
    '- "similarFilms" must be real, actually released films comparable in genre, tone, or budget, with their real box office, and "rating" as a critic-score percentage (e.g. "92% Critical"), not a /10 score.',
    '- 3-5 items per array unless there is not enough basis for that many.',
    '- Respond with ONLY a JSON object matching this exact shape - no markdown code fences, no commentary before or after:',
    RESPONSE_SHAPE_EXAMPLE,
  );

  return lines.join('\n');
}

function toMetrics(value: unknown, fieldName: string): MetricForm[] {
  if (!Array.isArray(value)) {
    throw new Error(`"${fieldName}" must be an array.`);
  }
  return value.map((item, i) => {
    if (typeof item !== 'object' || item === null) {
      throw new Error(`"${fieldName}[${i}]" must be an object.`);
    }
    const m = item as Record<string, unknown>;
    return {
      id: `metric-${Date.now()}-${i}`,
      label: String(m.label ?? ''),
      value: String(m.value ?? ''),
      description: String(m.description ?? ''),
    };
  });
}

function toSimilarFilms(value: unknown): SimilarFilmForm[] {
  if (value === undefined) return [];
  if (!Array.isArray(value)) {
    throw new Error('"similarFilms" must be an array.');
  }
  return value.map((item, i) => {
    const f = typeof item === 'object' && item !== null ? (item as Record<string, unknown>) : {};
    return {
      id: `similar-${Date.now()}-${i}`,
      title: String(f.title ?? ''),
      boxOffice: String(f.boxOffice ?? ''),
      roi: String(f.roi ?? ''),
      rating: String(f.rating ?? ''),
      matchPercent: Number(f.matchPercent ?? 0),
    };
  });
}

/** Parses and validates the JSON pasted back from the LLM. Throws a human-readable Error on any mismatch. */
export function parseAiAnalysisResponse(raw: string): AiAnalysisDraft {
  let data: unknown;
  try {
    data = JSON.parse(raw.trim());
  } catch {
    throw new Error('This is not valid JSON. Paste only the JSON object the AI returned.');
  }
  if (typeof data !== 'object' || data === null || Array.isArray(data)) {
    throw new Error('Expected a single JSON object, not an array or primitive.');
  }

  const obj = data as Record<string, unknown>;
  const overallScoreRaw = obj.overallScore;
  const overallScore = typeof overallScoreRaw === 'number' ? overallScoreRaw : Number(overallScoreRaw);
  if (Number.isNaN(overallScore)) {
    throw new Error('"overallScore" must be a number.');
  }

  return {
    aiAnalysis: {
      overallScore,
      marketInsights: toMetrics(obj.marketInsights, 'marketInsights'),
      teamTalent: toMetrics(obj.teamTalent, 'teamTalent'),
      investmentMetrics: toMetrics(obj.investmentMetrics, 'investmentMetrics'),
    },
    similarFilms: toSimilarFilms(obj.similarFilms),
  };
}
