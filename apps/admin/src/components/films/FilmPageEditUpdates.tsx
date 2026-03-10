import {
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

export function FilmPageEditUpdates({ form, setForm }: Props) {
  return (
    <section
      className={CLASS_SECTION}
      aria-labelledby="section-updates"
    >
      <h2 id="section-updates" className={CLASS_SECTION_TITLE}>
        Tab — Updates
      </h2>
      <p className={CLASS_SECTION_DESC}>
        Updates shown on the film page. The tab displays the number of
        items. Each item has date, title, and description.
      </p>
      <ul className="mt-4 space-y-4" role="list">
        {(form.updatesItems ?? []).map((item) => (
          <li key={item.id} className={CLASS_CARD}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-400">
                Update
              </span>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    updatesItems: (p.updatesItems ?? []).filter(
                      (u) => u.id !== item.id,
                    ),
                  }))
                }
                className={CLASS_BTN_REMOVE}
                aria-label={`Remove update ${item.title || ''}`}
              >
                Remove
              </button>
            </div>
            <div className="space-y-3">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Date</label>
                <input
                  type="text"
                  value={item.date}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      updatesItems: (p.updatesItems ?? []).map((u) =>
                        u.id === item.id
                          ? { ...u, date: e.target.value }
                          : u,
                      ),
                    }))
                  }
                  className={CLASS_INPUT_SM}
                  placeholder="e.g. November 2, 2025"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Title</label>
                <input
                  type="text"
                  value={item.title}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      updatesItems: (p.updatesItems ?? []).map((u) =>
                        u.id === item.id
                          ? { ...u, title: e.target.value }
                          : u,
                      ),
                    }))
                  }
                  className={CLASS_INPUT_SM}
                  placeholder="e.g. Lead actress confirmed!"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Description</label>
                <textarea
                  rows={3}
                  value={item.description}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      updatesItems: (p.updatesItems ?? []).map((u) =>
                        u.id === item.id
                          ? { ...u, description: e.target.value }
                          : u,
                      ),
                    }))
                  }
                  className={CLASS_INPUT_SM}
                  placeholder="Update description"
                />
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
            updatesItems: [
              ...(p.updatesItems ?? []),
              {
                id: `update-${Date.now()}`,
                date: '',
                title: '',
                description: '',
              },
            ],
          }))
        }
        className={CLASS_ADD_LINK}
      >
        + Add update
      </button>
    </section>
  );
}
