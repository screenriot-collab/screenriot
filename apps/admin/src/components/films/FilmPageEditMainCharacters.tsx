import { useState } from 'react';
import {
  CLASS_INPUT_SM,
  CLASS_SECTION,
  CLASS_SECTION_TITLE,
  CLASS_SECTION_DESC,
  CLASS_CARD,
  CLASS_BTN_REMOVE,
  CLASS_ADD_LINK,
} from '@/constants/styles';
import { CAST_TIER_OPTIONS } from '@/constants/films';
import { roleLine } from '@/lib/filmPageForm';
import { TmdbPersonSearchModal } from './TmdbPersonSearchModal';
import type { FilmPageFormState, MainCharacterForm } from '@/types/films';

const DEFAULT_TIER = CAST_TIER_OPTIONS[0].value;

function updateCharacterFields(
  char: MainCharacterForm,
  updates: Partial<Pick<MainCharacterForm, 'character' | 'tier'>>,
): MainCharacterForm {
  const next = { ...char, ...updates };
  return { ...next, role: roleLine(next.character ?? '', next.tier ?? DEFAULT_TIER) };
}

type Props = {
  form: FilmPageFormState;
  setForm: React.Dispatch<React.SetStateAction<FilmPageFormState>>;
};

export function FilmPageEditMainCharacters({ form, setForm }: Props) {
  const [tmdbSearchId, setTmdbSearchId] = useState<string | null>(null);
  const tmdbSearchChar = (form.mainCharacters ?? []).find((c) => c.id === tmdbSearchId) ?? null;

  function patchCharacter(id: string, patch: Partial<MainCharacterForm>) {
    setForm((p) => ({
      ...p,
      mainCharacters: (p.mainCharacters ?? []).map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }

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
              <span className="flex items-center gap-2 text-xs font-medium text-gray-400">
                {char.imageUrl ? (
                  <img src={char.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[11px] text-gray-500">
                    {(char.name || '?').trim().charAt(0).toUpperCase()}
                  </span>
                )}
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
                <button
                  type="button"
                  onClick={() => setTmdbSearchId(char.id)}
                  className="mt-1.5 rounded bg-admin-accent/15 px-2.5 py-1 text-xs font-medium text-admin-accent transition-colors hover:bg-admin-accent/25"
                >
                  Search TMDB
                </button>
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
                <label className="mb-1 block text-xs text-gray-400">Character</label>
                <input
                  type="text"
                  value={char.character ?? ''}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      mainCharacters: (p.mainCharacters ?? []).map((c) =>
                        c.id === char.id
                          ? updateCharacterFields(c, { character: e.target.value })
                          : c,
                      ),
                    }))
                  }
                  className={CLASS_INPUT_SM}
                  placeholder="e.g. Memory Trader"
                />
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Role Type</label>
                <select
                  value={char.tier ?? DEFAULT_TIER}
                  onChange={(e) =>
                    setForm((p) => ({
                      ...p,
                      mainCharacters: (p.mainCharacters ?? []).map((c) =>
                        c.id === char.id
                          ? updateCharacterFields(c, { tier: e.target.value })
                          : c,
                      ),
                    }))
                  }
                  className={CLASS_INPUT_SM}
                >
                  {CAST_TIER_OPTIONS.map((opt) => (
                    <option key={opt.value} value={opt.value}>
                      {opt.label}
                    </option>
                  ))}
                </select>
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
                character: '',
                tier: DEFAULT_TIER,
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

      <TmdbPersonSearchModal
        open={tmdbSearchId !== null}
        query={tmdbSearchChar?.name ?? ''}
        onClose={() => setTmdbSearchId(null)}
        onApply={(patch) => {
          if (tmdbSearchId) patchCharacter(tmdbSearchId, patch);
        }}
      />
    </section>
  );
}
