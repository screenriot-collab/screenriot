import {
  CLASS_INPUT,
  CLASS_INPUT_SM,
  CLASS_SECTION,
  CLASS_SECTION_TITLE,
  CLASS_SECTION_DESC,
  CLASS_CARD,
  CLASS_BTN_REMOVE,
  CLASS_ADD_LINK,
} from '@/constants/styles';
import type { FilmPageFormState } from '@/types/films';

type Props = {
  form: FilmPageFormState;
  setForm: React.Dispatch<React.SetStateAction<FilmPageFormState>>;
};

const defaultCastingVote = {
  title: 'Vote for Your Dream Cast',
  subtitle: '',
  tip: '',
  cast: [] as { id: string; name: string; role: string; votePercent: number; votes: number }[],
};

export function FilmPageEditCastingVote({ form, setForm }: Props) {
  const cv = form.castingVote ?? defaultCastingVote;
  return (
    <section
      className={CLASS_SECTION}
      aria-labelledby="section-casting-vote"
    >
      <h2 id="section-casting-vote" className={CLASS_SECTION_TITLE}>
        Fan voting — Dream cast
      </h2>
      <p className={CLASS_SECTION_DESC}>
        Shown under Fan Voting on the public page (not in tabs). Initial candidates can come
        from Wish List Cast in the application. Edits here do not modify application data.
      </p>
      <div className="space-y-3">
        <div>
          <label htmlFor="casting-title" className="mb-1 block text-xs text-gray-400">
            Section title
          </label>
          <input
            id="casting-title"
            type="text"
            value={cv.title}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                castingVote: {
                  title: e.target.value,
                  subtitle: p.castingVote?.subtitle ?? '',
                  tip: p.castingVote?.tip ?? '',
                  cast: p.castingVote?.cast ?? [],
                },
              }))
            }
            className={CLASS_INPUT}
            placeholder="Vote for Your Dream Cast"
          />
        </div>
        <div>
          <label htmlFor="casting-subtitle" className="mb-1 block text-xs text-gray-400">
            Subtitle
          </label>
          <input
            id="casting-subtitle"
            type="text"
            value={cv.subtitle}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                castingVote: {
                  title: p.castingVote?.title ?? 'Vote for Your Dream Cast',
                  subtitle: e.target.value,
                  tip: p.castingVote?.tip ?? '',
                  cast: p.castingVote?.cast ?? [],
                },
              }))
            }
            className={CLASS_INPUT}
            placeholder="Help us choose the perfect actors for this film."
          />
        </div>
        <div>
          <label htmlFor="casting-tip" className="mb-1 block text-xs text-gray-400">
            Tip text
          </label>
          <textarea
            id="casting-tip"
            rows={2}
            value={cv.tip}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                castingVote: {
                  title: p.castingVote?.title ?? 'Vote for Your Dream Cast',
                  subtitle: p.castingVote?.subtitle ?? '',
                  tip: e.target.value,
                  cast: p.castingVote?.cast ?? [],
                },
              }))
            }
            className={CLASS_INPUT}
          />
        </div>
      </div>
      <ul className="mt-4 space-y-4" role="list">
        {(form.castingVote?.cast ?? []).map((option) => (
          <li key={option.id} className={CLASS_CARD}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-400">
                Candidate
              </span>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => {
                    const current = p.castingVote ?? defaultCastingVote;
                    return {
                      ...p,
                      castingVote: {
                        ...current,
                        cast: (current.cast ?? []).filter(
                          (c) => c.id !== option.id,
                        ),
                      },
                    };
                  })
                }
                className={CLASS_BTN_REMOVE}
                aria-label={`Remove ${option.name || 'candidate'}`}
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Actor name</label>
                <input
                  type="text"
                  value={option.name}
                  onChange={(e) =>
                    setForm((p) => {
                      const current = p.castingVote ?? defaultCastingVote;
                      return {
                        ...p,
                        castingVote: {
                          ...current,
                          cast: current.cast.map((c) =>
                            c.id === option.id
                              ? { ...c, name: e.target.value }
                              : c,
                          ),
                        },
                      };
                    })
                  }
                  className={CLASS_INPUT_SM}
                  placeholder="e.g. Emma Stone"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Role</label>
                <input
                  type="text"
                  value={option.role}
                  onChange={(e) =>
                    setForm((p) => {
                      const current = p.castingVote ?? defaultCastingVote;
                      return {
                        ...p,
                        castingVote: {
                          ...current,
                          cast: current.cast.map((c) =>
                            c.id === option.id
                              ? { ...c, role: e.target.value }
                              : c,
                          ),
                        },
                      };
                    })
                  }
                  className={CLASS_INPUT_SM}
                  placeholder="e.g. Lead role"
                />
              </div>
            </div>
            <p
              className="mt-3 text-sm font-medium text-gray-200"
              aria-live="polite"
            >
              Votes:&nbsp;
              <span className="inline-block rounded bg-black/40 px-2 py-0.5 text-sm text-white">
                {typeof option.votes === 'number' ? option.votes : 0}
              </span>
            </p>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() =>
          setForm((p) => {
            const current = p.castingVote ?? defaultCastingVote;
            return {
              ...p,
              castingVote: {
                ...current,
                cast: [
                  ...(current.cast ?? []),
                  {
                    id: `cast-${Date.now()}`,
                    name: '',
                    role: '',
                    votePercent: 0,
                    votes: 0,
                  },
                ],
              },
            };
          })
        }
        className={CLASS_ADD_LINK}
      >
        + Add candidate
      </button>
    </section>
  );
}
