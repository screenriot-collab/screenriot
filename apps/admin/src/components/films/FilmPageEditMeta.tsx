import {
  CLASS_INPUT,
  CLASS_LABEL,
} from '@/constants/styles';
import type { FilmPageFormState } from '@/types/films';

type Props = {
  form: FilmPageFormState;
  setForm: React.Dispatch<React.SetStateAction<FilmPageFormState>>;
  slugDisplay: string;
};

export function FilmPageEditMeta({ form, setForm, slugDisplay }: Props) {
  return (
    <>
      <div className="flex flex-wrap items-center gap-3 rounded-md border border-white/10 bg-admin-sidebar p-3">
        <span
          id="page-published-desc"
          className="w-full text-xs text-gray-500 sm:w-auto sm:order-3"
        >
          When off, the film page is hidden from the public site (Discover,
          detail page).
        </span>
        <button
          type="button"
          id="page-published-toggle"
          role="switch"
          aria-checked={form.pagePublished ?? false}
          aria-labelledby="page-published-label page-published-desc"
          onClick={() =>
            setForm((p) => ({
              ...p,
              pagePublished: !(p.pagePublished ?? false),
            }))
          }
          className="relative inline-flex h-8 w-14 shrink-0 rounded-full border border-white/20 bg-red-500/30 transition-colors focus:outline-none focus:ring-2 focus:ring-admin-accent/50 focus:ring-offset-2 focus:ring-offset-admin-bg data-[state=on]:bg-emerald-500/30"
          data-state={form.pagePublished ? 'on' : 'off'}
        >
          <span
            className="pointer-events-none absolute inset-y-1 left-1 h-6 w-6 rounded-full bg-red-500 shadow transition-all duration-200 data-[state=on]:left-7 data-[state=on]:bg-emerald-500"
            data-state={form.pagePublished ? 'on' : 'off'}
          />
        </button>
        <span
          id="page-published-label"
          className="text-sm font-medium text-white"
        >
          Published on site
        </span>
      </div>

      <div className="mt-6 max-w-6xl">
        <span className={CLASS_LABEL}>Slug (from application)</span>
        <p
          id="page-slug"
          className="rounded-md border border-white/10 bg-white/5 px-3 py-2 text-sm text-gray-300"
          aria-readonly
        >
          /{slugDisplay}
        </p>
      </div>

      <div className="mt-6 max-w-6xl">
        <label htmlFor="page-title" className={CLASS_LABEL}>
          Title
        </label>
        <input
          id="page-title"
          type="text"
          value={form.title ?? ''}
          onChange={(e) => setForm((p) => ({ ...p, title: e.target.value }))}
          className={CLASS_INPUT}
          required
        />
      </div>

      <div className="mt-6 max-w-6xl">
        <label htmlFor="page-logline" className={CLASS_LABEL}>
          Logline
        </label>
        <p className="mb-1 text-xs text-gray-500">
          One-sentence pitch submitted by the filmmaker. Review and correct
          before publishing - this is never edited elsewhere.
        </p>
        <input
          id="page-logline"
          type="text"
          value={form.logline ?? ''}
          onChange={(e) => setForm((p) => ({ ...p, logline: e.target.value }))}
          className={CLASS_INPUT}
        />
      </div>

      <div className="mt-8">
        <label htmlFor="page-tags" className={CLASS_LABEL}>
          Tags (comma-separated)
        </label>
        <input
          id="page-tags"
          type="text"
          value={form.tags ?? ''}
          onChange={(e) => setForm((p) => ({ ...p, tags: e.target.value }))}
          placeholder="e.g. Sci-Fi, Thriller"
          className={CLASS_INPUT}
        />
      </div>

      <div className="mt-6">
        <label htmlFor="page-synopsis" className={CLASS_LABEL}>
          Short synopsis
        </label>
        <p className="mb-1 text-xs text-gray-500">
          Used for film cards and search - not the Synopsis shown on the film
          page itself. Edit that in the "Tab — Synopsis" section below
          ("Story synopsis").
        </p>
        <textarea
          id="page-synopsis"
          rows={4}
          value={form.synopsis ?? ''}
          onChange={(e) =>
            setForm((p) => ({ ...p, synopsis: e.target.value }))
          }
          className={CLASS_INPUT}
        />
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="page-director" className={CLASS_LABEL}>
            Director
          </label>
          <input
            id="page-director"
            type="text"
            value={form.directorName ?? ''}
            onChange={(e) =>
              setForm((p) => ({ ...p, directorName: e.target.value }))
            }
            className={CLASS_INPUT}
          />
        </div>
        <div>
          <label htmlFor="page-genre" className={CLASS_LABEL}>
            Genre
          </label>
          <input
            id="page-genre"
            type="text"
            value={form.genre ?? ''}
            onChange={(e) =>
              setForm((p) => ({ ...p, genre: e.target.value }))
            }
            className={CLASS_INPUT}
          />
        </div>
      </div>

      <div className="mt-3 grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="page-goal" className={CLASS_LABEL}>
            Goal amount
          </label>
          <input
            id="page-goal"
            type="number"
            min={0}
            step={1}
            value={form.goalAmount ?? ''}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                goalAmount: e.target.value
                  ? Number(e.target.value)
                  : undefined,
              }))
            }
            className={CLASS_INPUT}
          />
        </div>
        <div className="mt-3">
          <label htmlFor="page-deadline" className={CLASS_LABEL}>
            Deadline
          </label>
          <input
            id="page-deadline"
            type="datetime-local"
            value={form.deadline ?? ''}
            onChange={(e) =>
              setForm((p) => ({ ...p, deadline: e.target.value }))
            }
            className={CLASS_INPUT}
          />
        </div>
      </div>

      <div>
        <label htmlFor="page-poster" className={CLASS_LABEL}>
          Poster URL (optional, external link)
        </label>
        <input
          id="page-poster"
          type="url"
          value={form.posterUrl ?? ''}
          onChange={(e) =>
            setForm((p) => ({ ...p, posterUrl: e.target.value }))
          }
          className={CLASS_INPUT}
        />
      </div>
    </>
  );
}
