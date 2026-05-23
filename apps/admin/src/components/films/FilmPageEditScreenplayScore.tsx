import {
  CLASS_INPUT_SM,
  CLASS_SECTION,
  CLASS_SECTION_TITLE,
  CLASS_BTN_REMOVE,
  CLASS_ADD_LINK,
} from '@/constants/styles';
import type { FilmPageFormState } from '@/types/films';

type Props = {
  form: FilmPageFormState;
  setForm: React.Dispatch<React.SetStateAction<FilmPageFormState>>;
};

const defaultScore = {
  aiOverall: 0,
  expertOverall: 0,
  categories: [] as { name: string; aiScore: number; expertScore: number }[],
};

export function FilmPageEditScreenplayScore({ form, setForm }: Props) {
  const sc = form.screenplayScore ?? defaultScore;

  return (
    <section className={CLASS_SECTION} aria-labelledby="section-screenplay-score">
      <h2 id="section-screenplay-score" className={CLASS_SECTION_TITLE}>
        Screenplay Score
      </h2>
      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label htmlFor="screenplay-ai-overall" className="mb-1 block text-xs text-gray-400">
            AI overall (0–100)
          </label>
          <input
            id="screenplay-ai-overall"
            type="number"
            min={0}
            max={100}
            value={sc.aiOverall}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                screenplayScore: {
                  ...(p.screenplayScore ?? defaultScore),
                  aiOverall: Number(e.target.value),
                },
              }))
            }
            className={CLASS_INPUT_SM}
          />
        </div>
        <div>
          <label htmlFor="screenplay-expert-overall" className="mb-1 block text-xs text-gray-400">
            Expert overall (0–100)
          </label>
          <input
            id="screenplay-expert-overall"
            type="number"
            min={0}
            max={100}
            value={sc.expertOverall}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                screenplayScore: {
                  ...(p.screenplayScore ?? defaultScore),
                  expertOverall: Number(e.target.value),
                },
              }))
            }
            className={CLASS_INPUT_SM}
          />
        </div>
      </div>
      <div className="mt-4 space-y-3">
        {sc.categories.map((cat, index) => (
          <div key={index} className="grid gap-2 rounded-md border border-white/10 bg-admin-bg p-3 sm:grid-cols-4">
            <input
              type="text"
              value={cat.name}
              placeholder="Category name"
              onChange={(e) =>
                setForm((p) => {
                  const current = p.screenplayScore ?? defaultScore;
                  const categories = [...current.categories];
                  categories[index] = { ...categories[index], name: e.target.value };
                  return { ...p, screenplayScore: { ...current, categories } };
                })
              }
              className={CLASS_INPUT_SM}
            />
            <input
              type="number"
              min={0}
              max={100}
              value={cat.aiScore}
              placeholder="AI"
              onChange={(e) =>
                setForm((p) => {
                  const current = p.screenplayScore ?? defaultScore;
                  const categories = [...current.categories];
                  categories[index] = { ...categories[index], aiScore: Number(e.target.value) };
                  return { ...p, screenplayScore: { ...current, categories } };
                })
              }
              className={CLASS_INPUT_SM}
            />
            <input
              type="number"
              min={0}
              max={100}
              value={cat.expertScore}
              placeholder="Expert"
              onChange={(e) =>
                setForm((p) => {
                  const current = p.screenplayScore ?? defaultScore;
                  const categories = [...current.categories];
                  categories[index] = {
                    ...categories[index],
                    expertScore: Number(e.target.value),
                  };
                  return { ...p, screenplayScore: { ...current, categories } };
                })
              }
              className={CLASS_INPUT_SM}
            />
            <button
              type="button"
              className={CLASS_BTN_REMOVE}
              onClick={() =>
                setForm((p) => {
                  const current = p.screenplayScore ?? defaultScore;
                  return {
                    ...p,
                    screenplayScore: {
                      ...current,
                      categories: current.categories.filter((_, i) => i !== index),
                    },
                  };
                })
              }
            >
              Remove
            </button>
          </div>
        ))}
        <button
          type="button"
          className={CLASS_ADD_LINK}
          onClick={() =>
            setForm((p) => {
              const current = p.screenplayScore ?? defaultScore;
              return {
                ...p,
                screenplayScore: {
                  ...current,
                  categories: [...current.categories, { name: '', aiScore: 0, expertScore: 0 }],
                },
              };
            })
          }
        >
          + Add category
        </button>
      </div>
    </section>
  );
}
