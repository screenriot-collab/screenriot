import {
  CLASS_INPUT_SM,
  CLASS_SECTION,
  CLASS_SECTION_TITLE,
  CLASS_SECTION_DESC,
} from '@/constants/styles';
import type { FilmPageFormState } from '@/types/films';

type Props = {
  form: FilmPageFormState;
  setForm: React.Dispatch<React.SetStateAction<FilmPageFormState>>;
};

const defaultSampleScenes = {
  title: 'Sample Scenes',
  unlockMessage: '',
  pledgeAmount: 50,
  description: '',
};

export function FilmPageEditSampleScenes({ form, setForm }: Props) {
  const sc = form.sampleScenes ?? defaultSampleScenes;
  return (
    <section
      className={CLASS_SECTION}
      aria-labelledby="section-sample-scenes"
    >
      <h2 id="section-sample-scenes" className={CLASS_SECTION_TITLE}>
        Sample Scenes
      </h2>
      <p className={CLASS_SECTION_DESC}>
        Paid block: users who pledge the amount see the description. Title,
        unlock message and pledge amount are shown before unlock.
      </p>
      <div className="space-y-3">
        <div>
          <label htmlFor="sample-scenes-title" className="mb-1 block text-xs text-gray-400">
            Title
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
            placeholder="Sample Scenes"
          />
        </div>
        <div>
          <label htmlFor="sample-scenes-unlock-message" className="mb-1 block text-xs text-gray-400">
            Unlock message
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
            placeholder="Unlock sample scenes to get a deeper understanding..."
          />
        </div>
        <div>
          <label htmlFor="sample-scenes-pledge-amount" className="mb-1 block text-xs text-gray-400">
            Pledge amount (USD)
          </label>
          <input
            id="sample-scenes-pledge-amount"
            type="number"
            min={0}
            value={sc.pledgeAmount}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                sampleScenes: {
                  ...(p.sampleScenes ?? defaultSampleScenes),
                  pledgeAmount: Number(e.target.value) || 0,
                },
              }))
            }
            className={CLASS_INPUT_SM}
          />
        </div>
        <div>
          <label htmlFor="sample-scenes-description" className="mb-1 block text-xs text-gray-400">
            Description (content after unlock)
          </label>
          <textarea
            id="sample-scenes-description"
            rows={6}
            value={sc.description}
            onChange={(e) =>
              setForm((p) => ({
                ...p,
                sampleScenes: {
                  ...(p.sampleScenes ?? defaultSampleScenes),
                  description: e.target.value,
                },
              }))
            }
            className={CLASS_INPUT_SM}
            placeholder="Text shown to users who have unlocked (e.g. sample script excerpts, scene descriptions). Line breaks are preserved."
          />
        </div>
      </div>
    </section>
  );
}
