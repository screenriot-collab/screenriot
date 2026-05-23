import {
  CLASS_INPUT_SM,
  CLASS_SECTION,
  CLASS_SECTION_TITLE,
  CLASS_SECTION_DESC,
  CLASS_BTN_REMOVE,
  CLASS_ADD_LINK,
} from '@/constants/styles';
import type { FilmPageFormState, SampleScenesForm } from '@/types/films';

type Props = {
  form: FilmPageFormState;
  setForm: React.Dispatch<React.SetStateAction<FilmPageFormState>>;
};

const defaultSampleScenes: SampleScenesForm = {
  title: 'Script Sample',
  unlockMessage: 'Sample scenes will be published when the filmmaker adds them.',
  pledgeAmount: 0,
  description: '',
  pages: [{ title: 'Scene 1', content: '' }],
  unlockedPageCount: 1,
  lockedPageCount: 0,
  creditsPerPage: 1,
};

export function FilmPageEditSampleScenes({ form, setForm }: Props) {
  const sc = form.sampleScenes ?? defaultSampleScenes;
  const pages = sc.pages ?? [{ title: 'Scene 1', content: '' }];

  return (
    <section className={CLASS_SECTION} aria-labelledby="section-sample-scenes">
      <h2 id="section-sample-scenes" className={CLASS_SECTION_TITLE}>
        Script Sample
      </h2>
      <p className={CLASS_SECTION_DESC}>
        Multi-page script preview on the public film page. Unlocked pages are readable; locked
        pages show a blur overlay (credits unlock UI is coming soon).
      </p>
      <div className="space-y-3">
        <div>
          <label htmlFor="sample-scenes-title" className="mb-1 block text-xs text-gray-400">
            Section title
          </label>
          <input
            id="sample-scenes-title"
            type="text"
            value={sc.title}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                sampleScenes: {
                  ...(p.sampleScenes ?? defaultSampleScenes),
                  title: e.target.value,
                },
              }))
            }
            className={CLASS_INPUT_SM}
          />
        </div>
        <div>
          <label htmlFor="sample-scenes-unlock-message" className="mb-1 block text-xs text-gray-400">
            Empty state message
          </label>
          <input
            id="sample-scenes-unlock-message"
            type="text"
            value={sc.unlockMessage}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                sampleScenes: {
                  ...(p.sampleScenes ?? defaultSampleScenes),
                  unlockMessage: e.target.value,
                },
              }))
            }
            className={CLASS_INPUT_SM}
          />
        </div>
        <div>
          <label htmlFor="credits-per-page" className="mb-1 block text-xs text-gray-400">
            Credits per locked page
          </label>
          <input
            id="credits-per-page"
            type="number"
            min={1}
            max={20}
            value={sc.creditsPerPage ?? 1}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                sampleScenes: {
                  ...(p.sampleScenes ?? defaultSampleScenes),
                  creditsPerPage: Number(e.target.value),
                },
              }))
            }
            className={CLASS_INPUT_SM}
          />
        </div>
        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label htmlFor="unlocked-page-count" className="mb-1 block text-xs text-gray-400">
              Unlocked pages (readable)
            </label>
            <input
              id="unlocked-page-count"
              type="number"
              min={0}
              max={pages.length}
              value={sc.unlockedPageCount ?? pages.length}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  sampleScenes: {
                    ...(p.sampleScenes ?? defaultSampleScenes),
                    unlockedPageCount: Number(e.target.value),
                  },
                }))
              }
              className={CLASS_INPUT_SM}
            />
          </div>
          <div>
            <label htmlFor="locked-page-count" className="mb-1 block text-xs text-gray-400">
              Locked placeholder pages
            </label>
            <input
              id="locked-page-count"
              type="number"
              min={0}
              max={20}
              value={sc.lockedPageCount ?? 0}
              onChange={(e) =>
                setForm((p) => ({
                  ...p,
                  sampleScenes: {
                    ...(p.sampleScenes ?? defaultSampleScenes),
                    lockedPageCount: Number(e.target.value),
                  },
                }))
              }
              className={CLASS_INPUT_SM}
            />
          </div>
        </div>

        {pages.map((page, index) => (
          <div key={index} className="rounded-md border border-white/10 bg-admin-bg p-3">
            <div className="mb-2 flex items-center justify-between gap-2">
              <span className="text-xs font-medium text-gray-400">Page {index + 1}</span>
              {pages.length > 1 ? (
                <button
                  type="button"
                  className={CLASS_BTN_REMOVE}
                  onClick={() =>
                    setForm((p) => {
                      const current = p.sampleScenes ?? defaultSampleScenes;
                      const nextPages = (current.pages ?? []).filter((_, i) => i !== index);
                      return {
                        ...p,
                        sampleScenes: {
                          ...current,
                          pages: nextPages,
                          unlockedPageCount: Math.min(
                            current.unlockedPageCount ?? nextPages.length,
                            nextPages.length,
                          ),
                        },
                      };
                    })
                  }
                >
                  Remove page
                </button>
              ) : null}
            </div>
            <input
              type="text"
              value={page.title}
              onChange={(e) =>
                setForm((p) => {
                  const current = p.sampleScenes ?? defaultSampleScenes;
                  const nextPages = [...(current.pages ?? [])];
                  nextPages[index] = { ...nextPages[index], title: e.target.value };
                  return { ...p, sampleScenes: { ...current, pages: nextPages } };
                })
              }
              className={`${CLASS_INPUT_SM} mb-2`}
              placeholder="Scene title"
            />
            <textarea
              rows={5}
              value={page.content}
              onChange={(e) =>
                setForm((p) => {
                  const current = p.sampleScenes ?? defaultSampleScenes;
                  const nextPages = [...(current.pages ?? [])];
                  nextPages[index] = { ...nextPages[index], content: e.target.value };
                  const description = nextPages.map((pg) => pg.content).join('\n\n---\n\n');
                  return {
                    ...p,
                    sampleScenes: { ...current, pages: nextPages, description },
                  };
                })
              }
              className={CLASS_INPUT_SM}
              placeholder="Screenplay text (monospace on site)"
            />
          </div>
        ))}

        <button
          type="button"
          className={CLASS_ADD_LINK}
          onClick={() =>
            setForm((p) => {
              const current = p.sampleScenes ?? defaultSampleScenes;
              const nextPages = [
                ...(current.pages ?? []),
                {
                  id: `page-${Date.now()}`,
                  title: `Scene ${(current.pages?.length ?? 0) + 1}`,
                  content: '',
                },
              ];
              return {
                ...p,
                sampleScenes: {
                  ...current,
                  pages: nextPages,
                  unlockedPageCount: current.unlockedPageCount ?? nextPages.length,
                },
              };
            })
          }
        >
          + Add script page
        </button>
      </div>
    </section>
  );
}
