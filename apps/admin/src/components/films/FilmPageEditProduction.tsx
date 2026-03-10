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
import { PRODUCTION_STATUS_OPTIONS } from '@/constants/films';
import type {
  FilmPageFormState,
  ProductionStageForm,
} from '@/types/films';

type Props = {
  form: FilmPageFormState;
  setForm: React.Dispatch<React.SetStateAction<FilmPageFormState>>;
};

export function FilmPageEditProduction({ form, setForm }: Props) {
  return (
    <section
      className={CLASS_SECTION}
      aria-labelledby="section-production"
    >
      <h2 id="section-production" className={CLASS_SECTION_TITLE}>
        Tab — Production timeline
      </h2>
      <p className={CLASS_SECTION_DESC}>
        Configure production stages shown on the Production tab of the film
        page. Status controls the icon color: completed shows a green circle
        with a checkmark.
      </p>
      <div className="space-y-3">
        <div>
          <label htmlFor="production-title" className="mb-1 block text-xs text-gray-400">
            Section title
          </label>
          <input
            id="production-title"
            type="text"
            value={form.productionTitle ?? ''}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                productionTitle: e.target.value,
              }))
            }
            className={CLASS_INPUT}
            placeholder="Production Timeline"
          />
        </div>
      </div>
      <ul className="mt-4 space-y-4" role="list">
        {(form.productionStages ?? []).map((stage) => (
          <li key={stage.id} className={CLASS_CARD}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-400">
                Stage
              </span>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    productionStages: (p.productionStages ?? []).filter(
                      (s) => s.id !== stage.id,
                    ),
                  }))
                }
                className={CLASS_BTN_REMOVE}
                aria-label={`Remove stage ${stage.title || ''}`}
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Title</label>
                <input
                  type="text"
                  value={stage.title}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      productionStages: (p.productionStages ?? []).map(
                        (s) =>
                          s.id === stage.id
                            ? { ...s, title: e.target.value }
                            : s,
                      ),
                    }))
                  }
                  className={CLASS_INPUT_SM}
                  placeholder="e.g. Principal photography"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Period</label>
                <input
                  type="text"
                  value={stage.period}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      productionStages: (p.productionStages ?? []).map(
                        (s) =>
                          s.id === stage.id
                            ? { ...s, period: e.target.value }
                            : s,
                      ),
                    }))
                  }
                  className={CLASS_INPUT_SM}
                  placeholder="e.g. Q2 2026"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Status</label>
                <select
                  value={stage.status}
                  onChange={(e) => {
                    const next = e.target
                      .value as ProductionStageForm['status'];
                    setForm((p) => ({
                      ...p,
                      productionStages: (p.productionStages ?? []).map(
                        (s) =>
                          s.id === stage.id ? { ...s, status: next } : s,
                      ),
                    }));
                  }}
                  className={CLASS_INPUT_SM}
                >
                  {PRODUCTION_STATUS_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="flex items-end">
                <button
                  type="button"
                  onClick={() =>
                    setForm((p) => ({
                      ...p,
                      productionStages: (p.productionStages ?? []).map(
                        (s) =>
                          s.id === stage.id
                            ? { ...s, status: 'completed' }
                            : s,
                      ),
                    }))
                  }
                  className="text-xs font-medium text-emerald-400 hover:underline"
                >
                  Mark as completed
                </button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() =>
          setForm((p) => ({
            ...p,
            productionStages: [
              ...(p.productionStages ?? []),
              {
                id: `stage-${Date.now()}`,
                title: '',
                period: '',
                status: 'planned' as ProductionStageForm['status'],
              },
            ],
          }))
        }
        className={CLASS_ADD_LINK}
      >
        + Add stage
      </button>
    </section>
  );
}
