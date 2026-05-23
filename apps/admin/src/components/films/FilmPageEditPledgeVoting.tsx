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

const defaultFanVoting = {
  title: 'Fan Voting',
  subtitle: 'Rate this project and vote for your dream cast • Voting is free',
  pledgeAmount: 0,
  categories: [] as PledgeVotingCategoryForm[],
};

export function FilmPageEditPledgeVoting({ form, setForm }: Props) {
  const fanVoting = form.pledgeVoting ?? defaultFanVoting;
  return (
    <section className={CLASS_SECTION} aria-labelledby="section-fan-voting">
      <h2 id="section-fan-voting" className={CLASS_SECTION_TITLE}>
        Fan voting (free)
      </h2>
      <p className={CLASS_SECTION_DESC}>
        Title, subtitle, and voting categories. Community score is computed from user votes.
        Voting is free — investment is configured separately in the sidebar tiers.
      </p>
      <div className="space-y-3">
        <div>
          <label htmlFor="fan-voting-title" className="mb-1 block text-xs text-gray-400">
            Title
          </label>
          <input
            id="fan-voting-title"
            type="text"
            value={fanVoting.title}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                pledgeVoting: {
                  ...(p.pledgeVoting ?? defaultFanVoting),
                  title: e.target.value,
                },
              }))
            }
            className={CLASS_INPUT_SM}
            placeholder="Fan Voting"
          />
        </div>
        <div>
          <label htmlFor="fan-voting-subtitle" className="mb-1 block text-xs text-gray-400">
            Subtitle
          </label>
          <input
            id="fan-voting-subtitle"
            type="text"
            value={fanVoting.subtitle}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                pledgeVoting: {
                  ...(p.pledgeVoting ?? defaultFanVoting),
                  subtitle: e.target.value,
                },
              }))
            }
            className={CLASS_INPUT_SM}
            placeholder="Rate this project • Voting is free"
          />
        </div>
        {(form.pledgeVoting?.categories ?? []).map((cat) => (
          <div key={cat.id} className={CLASS_CARD}>
            <p className="text-sm font-medium text-white">{cat.label || cat.id}</p>
            <div className="mt-2 grid gap-2 sm:grid-cols-2">
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
                            c.id === cat.id ? { ...c, labelLeft: e.target.value } : c,
                          ),
                        }
                      : p.pledgeVoting,
                  }))
                }
                className={CLASS_INPUT_SM}
                placeholder="Left label"
              />
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
                            c.id === cat.id ? { ...c, labelRight: e.target.value } : c,
                          ),
                        }
                      : p.pledgeVoting,
                  }))
                }
                className={CLASS_INPUT_SM}
                placeholder="Right label"
              />
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
