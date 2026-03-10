import { STEP_1_FIELDS } from '@/markup/submit-project';
import type { SubmitProjectFormData } from '@/types/submit-project';

const LOGLINE_MAX = 2000;

const INPUT_CLASS =
  'mt-1 w-full rounded-lg border border-white/20 bg-screenriot-bg px-3 py-2 text-white placeholder:text-screenriot-muted focus:border-screenriot-accent-blue focus:outline-none focus:ring-1 focus:ring-screenriot-accent-blue';

interface Step1Props {
  step1: NonNullable<SubmitProjectFormData['step1']>;
  error: string | null;
  onChange: (field: keyof NonNullable<SubmitProjectFormData['step1']>, value: string) => void;
}

export function Step1ProjectDetails({ step1, error, onChange }: Step1Props) {
  return (
    <div className="space-y-5">
      <h2 className="text-lg font-semibold text-white">{STEP_1_FIELDS.sectionTitle}</h2>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <div>
        <label htmlFor="film-title" className="block text-sm font-medium text-white">
          {STEP_1_FIELDS.filmTitle.label} *
        </label>
        <input
          id="film-title"
          type="text"
          value={step1.filmTitle}
          onChange={(e) => onChange('filmTitle', e.target.value)}
          placeholder={STEP_1_FIELDS.filmTitle.placeholder}
          className={INPUT_CLASS}
        />
      </div>
      <div>
        <label htmlFor="logline" className="block text-sm font-medium text-white">
          {STEP_1_FIELDS.logline.label} *
        </label>
        <textarea
          id="logline"
          value={step1.logline}
          onChange={(e) => onChange('logline', e.target.value.slice(0, LOGLINE_MAX))}
          placeholder={STEP_1_FIELDS.logline.placeholder}
          rows={2}
          maxLength={LOGLINE_MAX}
          className={INPUT_CLASS}
        />
        <p className="mt-0.5 text-xs text-screenriot-muted">
          Maximum {LOGLINE_MAX} characters. {step1.logline.length}/{LOGLINE_MAX}
        </p>
      </div>
      <div>
        <label htmlFor="synopsis" className="block text-sm font-medium text-white">
          {STEP_1_FIELDS.synopsis.label} *
        </label>
        <textarea
          id="synopsis"
          value={step1.synopsis}
          onChange={(e) => onChange('synopsis', e.target.value)}
          placeholder={STEP_1_FIELDS.synopsis.placeholder}
          rows={4}
          className={INPUT_CLASS}
        />
      </div>
      <div className="grid gap-5 sm:grid-cols-3">
        <div>
          <label htmlFor="genre" className="block text-sm font-medium text-white">
            {STEP_1_FIELDS.genre.label} *
          </label>
          <input
            id="genre"
            type="text"
            value={step1.genre}
            onChange={(e) => onChange('genre', e.target.value)}
            placeholder={STEP_1_FIELDS.genre.placeholder}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="runtime" className="block text-sm font-medium text-white">
            {STEP_1_FIELDS.runtime.label} *
          </label>
          <input
            id="runtime"
            type="text"
            value={step1.runtime}
            onChange={(e) => onChange('runtime', e.target.value)}
            placeholder={STEP_1_FIELDS.runtime.placeholder}
            className={INPUT_CLASS}
          />
        </div>
        <div>
          <label htmlFor="rating" className="block text-sm font-medium text-white">
            {STEP_1_FIELDS.rating.label} *
          </label>
          <input
            id="rating"
            type="text"
            value={step1.rating}
            onChange={(e) => onChange('rating', e.target.value)}
            placeholder={STEP_1_FIELDS.rating.placeholder}
            className={INPUT_CLASS}
          />
        </div>
      </div>
      <div>
        <label htmlFor="director-name" className="block text-sm font-medium text-white">
          {STEP_1_FIELDS.directorName.label} *
        </label>
        <input
          id="director-name"
          type="text"
          value={step1.directorName}
          onChange={(e) => onChange('directorName', e.target.value)}
          placeholder={STEP_1_FIELDS.directorName.placeholder}
          className={INPUT_CLASS}
        />
      </div>
    </div>
  );
}
