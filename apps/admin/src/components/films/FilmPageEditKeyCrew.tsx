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
import { KEY_CREW_ROLE_OPTIONS } from '@/types/films';
import { TmdbPersonSearchModal } from './TmdbPersonSearchModal';
import type { FilmPageFormState, KeyCrewMemberForm } from '@/types/films';

const DEFAULT_ROLE = KEY_CREW_ROLE_OPTIONS[0];

type Props = {
  form: FilmPageFormState;
  setForm: React.Dispatch<React.SetStateAction<FilmPageFormState>>;
};

export function FilmPageEditKeyCrew({ form, setForm }: Props) {
  const [tmdbSearchId, setTmdbSearchId] = useState<string | null>(null);
  const tmdbSearchMember = (form.keyCrew ?? []).find((c) => c.id === tmdbSearchId) ?? null;

  function patchMember(id: string, patch: Partial<KeyCrewMemberForm>) {
    setForm((p) => ({
      ...p,
      keyCrew: (p.keyCrew ?? []).map((c) => (c.id === id ? { ...c, ...patch } : c)),
    }));
  }

  return (
    <section className={CLASS_SECTION} aria-labelledby="section-key-crew">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 id="section-key-crew" className={CLASS_SECTION_TITLE}>
            Key Crew
          </h2>
          <p className={CLASS_SECTION_DESC}>
            Director, screenwriter, cinematographer. Pre-filled from the application&apos;s Step 3 crew list,
            then editable here only — the application itself can no longer be edited once the page exists.
          </p>
        </div>
        <label className="flex shrink-0 items-center gap-2 text-sm text-gray-300">
          <input
            type="checkbox"
            checked={form.keyCrewVisible ?? false}
            onChange={(e) => setForm((p) => ({ ...p, keyCrewVisible: e.target.checked }))}
            className="accent-admin-accent"
          />
          Show on page
        </label>
      </div>

      <ul className="mt-4 space-y-4" role="list">
        {(form.keyCrew ?? []).map((member) => (
          <li key={member.id} className={CLASS_CARD}>
            <div className="mb-3 flex items-center justify-between gap-2">
              <span className="flex items-center gap-2 text-xs font-medium text-gray-400">
                {member.imageUrl ? (
                  <img src={member.imageUrl} alt="" className="h-8 w-8 rounded-full object-cover" />
                ) : (
                  <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-[11px] text-gray-500">
                    {(member.name || '?').trim().charAt(0).toUpperCase()}
                  </span>
                )}
                Crew Member
              </span>
              <button
                type="button"
                onClick={() =>
                  setForm((p) => ({
                    ...p,
                    keyCrew: (p.keyCrew ?? []).filter((c) => c.id !== member.id),
                  }))
                }
                className={CLASS_BTN_REMOVE}
                aria-label={`Remove ${member.name || 'crew member'}`}
              >
                Remove
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="mb-1 block text-xs text-gray-400">Name</label>
                <input
                  type="text"
                  value={member.name}
                  onChange={(e) => patchMember(member.id, { name: e.target.value })}
                  className={CLASS_INPUT_SM}
                  placeholder="e.g. Alex Rivera"
                />
                <button
                  type="button"
                  onClick={() => setTmdbSearchId(member.id)}
                  className="mt-1.5 rounded bg-admin-accent/15 px-2.5 py-1 text-xs font-medium text-admin-accent transition-colors hover:bg-admin-accent/25"
                >
                  Search TMDB
                </button>
              </div>
              <div>
                <label className="mb-1 block text-xs text-gray-400">Role</label>
                <select
                  value={member.role}
                  onChange={(e) => patchMember(member.id, { role: e.target.value })}
                  className={CLASS_INPUT_SM}
                >
                  {KEY_CREW_ROLE_OPTIONS.map((role) => (
                    <option key={role} value={role}>
                      {role}
                    </option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="mb-1 block text-xs text-gray-400">Email</label>
                <input
                  type="email"
                  value={member.email ?? ''}
                  onChange={(e) => patchMember(member.id, { email: e.target.value })}
                  className={CLASS_INPUT_SM}
                  placeholder="crew@email.com"
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
            keyCrew: [
              ...(p.keyCrew ?? []),
              { id: `crew-${Date.now()}`, name: '', role: DEFAULT_ROLE, email: '', imageUrl: null },
            ],
          }))
        }
        className={CLASS_ADD_LINK}
      >
        + Add crew member
      </button>

      <TmdbPersonSearchModal
        open={tmdbSearchId !== null}
        query={tmdbSearchMember?.name ?? ''}
        onClose={() => setTmdbSearchId(null)}
        onApply={(patch) => {
          if (tmdbSearchId) patchMember(tmdbSearchId, patch);
        }}
      />
    </section>
  );
}
