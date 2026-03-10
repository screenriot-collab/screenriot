import {
  CLASS_INPUT_SM,
  CLASS_SECTION,
  CLASS_SECTION_TITLE,
  CLASS_SECTION_DESC,
  CLASS_CARD,
} from '@/constants/styles';
import type {
  FilmPageFormState,
  PledgeVotingCategoryForm,
} from '@/types/films';

type Props = {
  form: FilmPageFormState;
  setForm: React.Dispatch<React.SetStateAction<FilmPageFormState>>;
};

const defaultPledge = {
  title: 'Pledge-Based Voting',
  subtitle: '',
  pledgeAmount: 25,
  categories: [] as PledgeVotingCategoryForm[],
};

export function FilmPageEditPledgeVoting({ form, setForm }: Props) {
  const pledge = form.pledgeVoting ?? defaultPledge;
  return (
    <section
      className={CLASS_SECTION}
      aria-labelledby="section-pledge-voting"
    >
      <h2 id="section-pledge-voting" className={CLASS_SECTION_TITLE}>
        Pledge-Based Voting
      </h2>
      <p className={CLASS_SECTION_DESC}>
        Title, editable text (subtitle) and 3 voting categories. Community:
        X/10 is computed from user votes.
      </p>
      <div className="space-y-3">
        <div>
          <label htmlFor="pledge-voting-title" className="mb-1 block text-xs text-gray-400">
            Title
          </label>
          <input
            id="pledge-voting-title"
            type="text"
            value={pledge.title}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                pledgeVoting: {
                  ...(p.pledgeVoting ?? defaultPledge),
                  title: e.target.value,
                },
              }))
            }
            className={CLASS_INPUT_SM}
            placeholder="Pledge-Based Voting"
          />
        </div>
        <div>
          <label htmlFor="pledge-voting-subtitle" className="mb-1 block text-xs text-gray-400">
            Subtitle (editable text)
          </label>
          <input
            id="pledge-voting-subtitle"
            type="text"
            value={pledge.subtitle}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                pledgeVoting: {
                  ...(p.pledgeVoting ?? defaultPledge),
                  subtitle: e.target.value,
                },
              }))
            }
            className={CLASS_INPUT_SM}
            placeholder="$25 pledge per category • Held in escrow..."
          />
        </div>
        <div>
          <label htmlFor="pledge-voting-amount" className="mb-1 block text-xs text-gray-400">
            Pledge amount (USD)
          </label>
          <input
            id="pledge-voting-amount"
            type="number"
            min={0}
            value={pledge.pledgeAmount ?? 25}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                pledgeVoting: {
                  ...(p.pledgeVoting ?? defaultPledge),
                  pledgeAmount: Number(e.target.value) || 0,
                },
              }))
            }
            className={CLASS_INPUT_SM}
          />
        </div>
      </div>
      <ul className="mt-4 space-y-4" role="list">
        {(form.pledgeVoting?.categories ?? []).map((cat) => (
          <li key={cat.id} className={CLASS_CARD}>
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-400">
                {cat.label || cat.id}
              </span>
              {typeof cat.communityScore === 'number' && (
                <span
                  className="rounded bg-black/40 px-2 py-0.5 text-xs text-white"
                  aria-live="polite"
                >
                  Community: {cat.communityScore}/{cat.communityMax ?? 10}
                </span>
              )}
            </div>
            <div className="grid gap-2 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Label</label>
                <input
                  type="text"
                  value={cat.label}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      pledgeVoting: p.pledgeVoting
                        ? {
                            ...p.pledgeVoting,
                            categories: p.pledgeVoting.categories.map((c) =>
                              c.id === cat.id
                                ? { ...c, label: e.target.value }
                                : c,
                            ),
                          }
                        : p.pledgeVoting,
                    }))
                  }
                  className={CLASS_INPUT_SM}
                  placeholder="e.g. Story Uniqueness"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Icon</label>
                <select
                  value={cat.icon}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      pledgeVoting: p.pledgeVoting
                        ? {
                            ...p.pledgeVoting,
                            categories: p.pledgeVoting.categories.map((c) =>
                              c.id === cat.id
                                ? {
                                    ...c,
                                    icon: e.target
                                      .value as PledgeVotingCategoryForm['icon'],
                                  }
                                : c,
                            ),
                          }
                        : p.pledgeVoting,
                    }))
                  }
                  className={CLASS_INPUT_SM}
                >
                  <option value="story">story</option>
                  <option value="script">script</option>
                  <option value="casting">casting</option>
                </select>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Label left</label>
                <input
                  type="text"
                  value={cat.labelLeft}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      pledgeVoting: p.pledgeVoting
                        ? {
                            ...p.pledgeVoting,
                            categories: p.pledgeVoting.categories.map((c) =>
                              c.id === cat.id
                                ? { ...c, labelLeft: e.target.value }
                                : c,
                            ),
                          }
                        : p.pledgeVoting,
                    }))
                  }
                  className={CLASS_INPUT_SM}
                  placeholder="Not Unique"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Label right</label>
                <input
                  type="text"
                  value={cat.labelRight}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      pledgeVoting: p.pledgeVoting
                        ? {
                            ...p.pledgeVoting,
                            categories: p.pledgeVoting.categories.map((c) =>
                              c.id === cat.id
                                ? { ...c, labelRight: e.target.value }
                                : c,
                            ),
                          }
                        : p.pledgeVoting,
                    }))
                  }
                  className={CLASS_INPUT_SM}
                  placeholder="Highly Original"
                />
              </div>
            </div>
          </li>
        ))}
      </ul>
    </section>
  );
}
