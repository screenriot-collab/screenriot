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

export function FilmPageEditMainCharacters({ form, setForm }: Props) {
  return (
    <section
      className={CLASS_SECTION}
      aria-labelledby="section-main-characters"
    >
      <h2 id="section-main-characters" className={CLASS_SECTION_TITLE}>
        Main Characters
      </h2>
      <p className={CLASS_SECTION_DESC}>
        Shown in Story &amp; Characters on the film page. Data is stored
        only here (Edit film page). Description does not come from the
        application — write it here. Icons use initials if no image.
      </p>
      <ul className="space-y-4" role="list">
        {(form.mainCharacters ?? []).map((char) => (
          <li key={char.id} className={CLASS_CARD}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-400">
                Character
              </span>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    mainCharacters: (p.mainCharacters ?? []).filter(
                      (c) => c.id !== char.id,
                    ),
                  }))
                }
                className={CLASS_BTN_REMOVE}
                aria-label={`Remove ${char.name || 'character'}`}
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-1">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Actor Name</label>
                <input
                  type="text"
                  value={char.name}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      mainCharacters: (p.mainCharacters ?? []).map((c) =>
                        c.id === char.id ? { ...c, name: e.target.value } : c,
                      ),
                    }))
                  }
                  className={CLASS_INPUT_SM}
                  placeholder="e.g. Dr. Elena Voss"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Verification Email</label>
                <input
                  type="email"
                  value={char.actorEmail ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      mainCharacters: (p.mainCharacters ?? []).map((c) =>
                        c.id === char.id
                          ? { ...c, actorEmail: e.target.value }
                          : c,
                      ),
                    }))
                  }
                  className={CLASS_INPUT_SM}
                  placeholder="actor@email.com"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Role</label>
                <input
                  type="text"
                  value={char.role}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      mainCharacters: (p.mainCharacters ?? []).map((c) =>
                        c.id === char.id ? { ...c, role: e.target.value } : c,
                      ),
                    }))
                  }
                  className={CLASS_INPUT_SM}
                  placeholder="e.g. Memory Trader"
                />
              </div>
            </div>
            <div className="mt-3">
              <label className="mb-1 block text-xs text-gray-400">Description</label>
              <textarea
                rows={3}
                value={char.description}
                onChange={(e) =>
                  setForm((p) => ({
                    ...p,
                    mainCharacters: (p.mainCharacters ?? []).map((c) =>
                      c.id === char.id
                        ? { ...c, description: e.target.value }
                        : c,
                    ),
                  }))
                }
                className={CLASS_INPUT_SM}
                placeholder="Character biography (shown on film page with Read more / Show less)"
              />
            </div>
          </li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() =>
          setForm((p) => ({
            ...p,
            mainCharacters: [
              ...(p.mainCharacters ?? []),
              {
                id: `cast-${Date.now()}`,
                name: '',
                role: '',
                description: '',
                imageUrl: null,
                actorEmail: '',
              },
            ],
          }))
        }
        className={CLASS_ADD_LINK}
      >
        + Add character
      </button>
    </section>
  );
}
