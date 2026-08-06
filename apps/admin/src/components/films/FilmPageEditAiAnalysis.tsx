import { useState } from 'react';
import {
  CLASS_INPUT_SM,
  CLASS_SECTION,
  CLASS_SECTION_TITLE,
  CLASS_SECTION_DESC,
  CLASS_BTN_REMOVE,
  CLASS_ADD_LINK,
} from '@/constants/styles';
import { TmdbMovieSearchModal } from './TmdbMovieSearchModal';
import type { AiAnalysisForm, FilmPageFormState, MetricForm } from '@/types/films';

type Props = {
  form: FilmPageFormState;
  setForm: React.Dispatch<React.SetStateAction<FilmPageFormState>>;
};

const defaultAi: AiAnalysisForm = {
  overallScore: 0,
  marketInsights: [],
  teamTalent: [],
  investmentMetrics: [],
};

function MetricList({
  label,
  metrics,
  onChange,
}: {
  label: string;
  metrics: MetricForm[];
  onChange: (next: MetricForm[]) => void;
}) {
  return (
    <div>
      <p className="mb-2 text-xs font-medium text-gray-400">{label}</p>
      <div className="space-y-2">
        {metrics.map((m, index) => (
          <div key={m.id} className="grid gap-2 rounded-md border border-white/10 bg-admin-bg p-2 sm:grid-cols-4">
            <input
              type="text"
              value={m.label}
              placeholder="Label"
              onChange={(e) => {
                const next = [...metrics];
                next[index] = { ...next[index], label: e.target.value };
                onChange(next);
              }}
              className={CLASS_INPUT_SM}
            />
            <input
              type="text"
              value={m.value}
              placeholder="Value"
              onChange={(e) => {
                const next = [...metrics];
                next[index] = { ...next[index], value: e.target.value };
                onChange(next);
              }}
              className={CLASS_INPUT_SM}
            />
            <input
              type="text"
              value={m.description}
              placeholder="Description"
              onChange={(e) => {
                const next = [...metrics];
                next[index] = { ...next[index], description: e.target.value };
                onChange(next);
              }}
              className={CLASS_INPUT_SM}
            />
            <button type="button" className={CLASS_BTN_REMOVE} onClick={() => onChange(metrics.filter((_, i) => i !== index))}>
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className={CLASS_ADD_LINK}
          onClick={() =>
            onChange([
              ...metrics,
              { id: `metric-${Date.now()}`, label: '', value: '', description: '' },
            ])
          }
        >
          + Add metric
        </button>
      </div>
    </div>
  );
}

export function FilmPageEditAiAnalysis({ form, setForm }: Props) {
  const ai = form.aiAnalysis ?? defaultAi;
  const similar = form.similarFilms ?? [];
  const [tmdbSearchOpen, setTmdbSearchOpen] = useState(false);

  return (
    <>
      <section className={CLASS_SECTION} aria-labelledby="section-ai-analysis">
        <h2 id="section-ai-analysis" className={CLASS_SECTION_TITLE}>
          AI Market Analysis
        </h2>
        <div className="mb-4">
          <label htmlFor="ai-overall-score" className="mb-1 block text-xs text-gray-400">
            Overall score (0–100)
          </label>
          <input
            id="ai-overall-score"
            type="number"
            min={0}
            max={100}
            value={ai.overallScore}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                aiAnalysis: {
                  ...(p.aiAnalysis ?? defaultAi),
                  overallScore: Number(e.target.value),
                },
              }))
            }
            className={`${CLASS_INPUT_SM} max-w-xs`}
          />
        </div>
        <div className="space-y-6">
          <MetricList
            label="Market insights"
            metrics={ai.marketInsights}
            onChange={(marketInsights) =>
              setForm((p) => ({
                ...p,
                aiAnalysis: { ...(p.aiAnalysis ?? defaultAi), marketInsights },
              }))
            }
          />
          <MetricList
            label="Team & talent"
            metrics={ai.teamTalent}
            onChange={(teamTalent) =>
              setForm((p) => ({
                ...p,
                aiAnalysis: { ...(p.aiAnalysis ?? defaultAi), teamTalent },
              }))
            }
          />
          <MetricList
            label="Investment metrics"
            metrics={ai.investmentMetrics}
            onChange={(investmentMetrics) =>
              setForm((p) => ({
                ...p,
                aiAnalysis: { ...(p.aiAnalysis ?? defaultAi), investmentMetrics },
              }))
            }
          />
        </div>
      </section>

      <section className={CLASS_SECTION} aria-labelledby="section-similar-films">
        <h2 id="section-similar-films" className={CLASS_SECTION_TITLE}>
          Similar films (inside AI section)
        </h2>
        <p className={CLASS_SECTION_DESC}>
          The plan is for this list to eventually be generated automatically by AI. For now, add entries by
          hand, or look one up on TMDB below — either way fills the same fields. ROI and Match % are our own
          scoring, not TMDB data, so they stay manual either way.
        </p>
        <div className="space-y-3">
          {similar.map((film, index) => (
            <div key={film.id} className="flex gap-3 rounded-md border border-white/10 bg-admin-bg p-3">
              {film.posterUrl ? (
                <img src={film.posterUrl} alt="" className="h-24 w-16 shrink-0 rounded object-cover" />
              ) : (
                <span className="flex h-24 w-16 shrink-0 items-center justify-center rounded bg-white/10 text-xs text-gray-500">
                  No poster
                </span>
              )}
              <div className="grid flex-1 gap-2 sm:grid-cols-3">
                {(['title', 'boxOffice', 'roi', 'rating'] as const).map((field) => (
                  <input
                    key={field}
                    type="text"
                    value={film[field]}
                    placeholder={field}
                    onChange={(e) =>
                      setForm((p) => {
                        const list = [...(p.similarFilms ?? [])];
                        list[index] = { ...list[index], [field]: e.target.value };
                        return { ...p, similarFilms: list };
                      })
                    }
                    className={CLASS_INPUT_SM}
                  />
                ))}
                <input
                  type="number"
                  min={0}
                  max={100}
                  value={film.matchPercent}
                  placeholder="Match %"
                  onChange={(e) =>
                    setForm((p) => {
                      const list = [...(p.similarFilms ?? [])];
                      list[index] = { ...list[index], matchPercent: Number(e.target.value) };
                      return { ...p, similarFilms: list };
                    })
                  }
                  className={CLASS_INPUT_SM}
                />
                <button
                  type="button"
                  className={CLASS_BTN_REMOVE}
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      similarFilms: (p.similarFilms ?? []).filter((_, i) => i !== index),
                    }))
                  }
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <div className="flex flex-wrap gap-4">
            <button
              type="button"
              className={CLASS_ADD_LINK}
              onClick={() =>
                setForm((p) => ({
                  ...p,
                  similarFilms: [
                    ...(p.similarFilms ?? []),
                    {
                      id: `similar-${Date.now()}`,
                      title: '',
                      boxOffice: '',
                      roi: '',
                      rating: '',
                      matchPercent: 0,
                    },
                  ],
                }))
              }
            >
              + Add similar film
            </button>
            <button type="button" className={CLASS_ADD_LINK} onClick={() => setTmdbSearchOpen(true)}>
              + Add similar film (search TMDB)
            </button>
          </div>
        </div>

        <TmdbMovieSearchModal
          open={tmdbSearchOpen}
          onClose={() => setTmdbSearchOpen(false)}
          onAdd={(film) =>
            setForm((p) => ({
              ...p,
              similarFilms: [...(p.similarFilms ?? []), film],
            }))
          }
        />
      </section>
    </>
  );
}
