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
import { ImageUrlPickerModal } from './ImageUrlPickerModal';
import { buildAiAnalysisPrompt, parseAiAnalysisResponse } from '@/lib/aiAnalysisPrompt';
import type { AdminFilm, AiAnalysisForm, FilmPageFormState, MetricForm } from '@/types/films';

type Props = {
  film: AdminFilm;
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

export function FilmPageEditAiAnalysis({ film, form, setForm }: Props) {
  const ai = form.aiAnalysis ?? defaultAi;
  const similar = form.similarFilms ?? [];
  const [tmdbSearchOpen, setTmdbSearchOpen] = useState(false);
  const [posterPickerId, setPosterPickerId] = useState<string | null>(null);
  const posterPickerFilm = similar.find((f) => f.id === posterPickerId) ?? null;
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied' | 'error'>('idle');
  const [pastedResponse, setPastedResponse] = useState('');
  const [applyError, setApplyError] = useState<string | null>(null);
  const [methodologyNote, setMethodologyNote] = useState<string | null>(null);

  async function handleCopyPrompt() {
    try {
      await navigator.clipboard.writeText(buildAiAnalysisPrompt(film));
      setCopyStatus('copied');
    } catch {
      setCopyStatus('error');
    }
    setTimeout(() => setCopyStatus('idle'), 2000);
  }

  function handleApplyResponse() {
    setApplyError(null);
    try {
      const draft = parseAiAnalysisResponse(pastedResponse);
      setForm((p) => ({
        ...p,
        aiAnalysis: draft.aiAnalysis,
        similarFilms: [...(p.similarFilms ?? []), ...draft.similarFilms],
      }));
      setPastedResponse('');
      setMethodologyNote(draft.methodologyNote || null);
    } catch (err) {
      setApplyError(err instanceof Error ? err.message : 'Could not read that response.');
      setMethodologyNote(null);
    }
  }

  return (
    <>
      <section className={CLASS_SECTION} aria-labelledby="section-ai-analysis-assistant">
        <h2 id="section-ai-analysis-assistant" className={CLASS_SECTION_TITLE}>
          AI Analysis Assistant (manual)
        </h2>
        <p className={CLASS_SECTION_DESC}>
          MVP stand-in until a real analytics vendor is integrated. Copy the prompt below, run it in any
          LLM you have access to (Claude, ChatGPT, etc.), then paste the JSON response back here to fill in
          the fields below. Nothing is sent from this app - review and edit before saving.
        </p>
        <div className="flex flex-wrap items-center gap-3">
          <button
            type="button"
            onClick={handleCopyPrompt}
            className="rounded bg-admin-accent/15 px-3 py-1.5 text-xs font-medium text-admin-accent transition-colors hover:bg-admin-accent/25"
          >
            Copy prompt
          </button>
          {copyStatus === 'copied' && <span className="text-xs leading-none text-green-400">Copied to clipboard.</span>}
          {copyStatus === 'error' && (
            <span className="text-xs leading-none text-red-400">Could not copy - copy it manually from the console.</span>
          )}
        </div>
        <div className="mt-4">
          <label htmlFor="ai-response-paste" className="mb-1 block text-xs text-gray-400">
            Paste the AI&apos;s JSON response here
          </label>
          <textarea
            id="ai-response-paste"
            rows={6}
            value={pastedResponse}
            onChange={(e) => setPastedResponse(e.target.value)}
            className={CLASS_INPUT_SM}
            placeholder='{ "overallScore": 78, "marketInsights": [...], ... }'
          />
          {applyError && <p className="mt-1 text-xs text-red-400">{applyError}</p>}
          <button
            type="button"
            onClick={handleApplyResponse}
            disabled={!pastedResponse.trim()}
            className="mt-2 rounded bg-admin-accent/15 px-2.5 py-1 text-xs font-medium text-admin-accent transition-colors hover:bg-admin-accent/25 disabled:opacity-50"
          >
            Apply to fields below
          </button>
          {methodologyNote && (
            <div className="mt-4 rounded-md border border-amber-500/30 bg-amber-500/10 px-3 py-2.5 text-sm text-gray-200">
              <p className="font-medium text-amber-400">Methodology (not saved, verify before trusting)</p>
              <p className="mt-1 whitespace-pre-wrap">{methodologyNote}</p>
            </div>
          )}
        </div>
      </section>

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
              <button
                type="button"
                onClick={() => setPosterPickerId(film.id)}
                className="group relative h-24 w-16 shrink-0 overflow-hidden rounded"
                aria-label={film.posterUrl ? 'Change poster' : 'Set poster'}
              >
                {film.posterUrl ? (
                  <img src={film.posterUrl} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="flex h-full w-full items-center justify-center bg-white/10 text-xs text-gray-500">
                    No poster
                  </span>
                )}
                <span className="absolute inset-0 flex items-center justify-center bg-black/60 text-[10px] font-medium text-white opacity-0 transition-opacity group-hover:opacity-100">
                  {film.posterUrl ? 'Change' : 'Set poster'}
                </span>
              </button>
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

        <ImageUrlPickerModal
          open={posterPickerId !== null}
          kind="movie"
          title="Set poster"
          initialQuery={posterPickerFilm?.title ?? ''}
          currentUrl={posterPickerFilm?.posterUrl}
          onClose={() => setPosterPickerId(null)}
          onApply={(url) => {
            if (!posterPickerId) return;
            setForm((p) => ({
              ...p,
              similarFilms: (p.similarFilms ?? []).map((f) =>
                f.id === posterPickerId ? { ...f, posterUrl: url || undefined } : f,
              ),
            }));
          }}
        />
      </section>
    </>
  );
}
