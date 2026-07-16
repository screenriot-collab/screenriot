import {
  CLASS_INPUT,
  CLASS_SECTION,
  CLASS_SECTION_TITLE,
  CLASS_LABEL,
} from '@/constants/styles';
import type { AdminFilm, FilmPageFormState } from '@/types/films';

type Props = {
  form: FilmPageFormState;
  setForm: React.Dispatch<React.SetStateAction<FilmPageFormState>>;
  film: AdminFilm;
};

export function FilmPageEditSynopsisTab({ form, setForm, film }: Props) {
  return (
    <section
      className={CLASS_SECTION}
      aria-labelledby="section-synopsis"
    >
      <h2 id="section-synopsis" className={CLASS_SECTION_TITLE}>
        Tab — Synopsis (shown on the film page)
      </h2>
      <div className="space-y-3">
        <div>
          <label
            htmlFor="page-story-synopsis"
            className="mb-1 block text-xs font-medium text-gray-400"
          >
            Story synopsis
          </label>
          <textarea
            id="page-story-synopsis"
            rows={3}
            value={form.storySynopsis ?? ''}
            onChange={(e) =>
              setForm((p) => ({ ...p, storySynopsis: e.target.value }))
            }
            className={CLASS_INPUT}
          />
        </div>
        <div>
          <label
            htmlFor="page-why-matters"
            className="mb-1 block text-xs font-medium text-gray-400"
          >
            Why it matters
          </label>
          <textarea
            id="page-why-matters"
            rows={2}
            value={form.whyMatters ?? ''}
            onChange={(e) =>
              setForm((p) => ({ ...p, whyMatters: e.target.value }))
            }
            className={CLASS_INPUT}
          />
        </div>
        <div>
          <span className={CLASS_LABEL}>
            Budget breakdown (from application)
          </span>
          <p className="mb-2 text-xs text-gray-500">
            Shown on the site from step4.breakdown. Edit in the application
            if needed.
          </p>
          {film.step4?.breakdown && film.step4.breakdown.length > 0 ? (
            <ul
              className="rounded-md border border-white/10 bg-admin-bg p-3 text-sm"
              role="list"
            >
              {film.step4.breakdown.map((b, idx) => (
                <li
                  key={b.id ?? idx}
                  className="flex justify-between gap-2 border-b border-white/5 py-1.5 last:border-0"
                >
                  <span className="text-gray-300">{b.label ?? '—'}</span>
                  <span className="text-gray-500">{b.percent ?? 0}%</span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="rounded-md border border-white/10 bg-admin-bg px-3 py-2 text-xs text-gray-500">
              No breakdown in application.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
