import { IMAGES } from '@/lib/constants';
import {
  STEP_3_SECTION,
  STEP_3_CAST,
  STEP_3_CREW,
  STEP_3_WISHLIST,
} from '@/markup/submit-project';
import type { SubmitProjectFormData } from '@/types/submit-project';

const INPUT_CLASS =
  'mt-1 w-full rounded-lg border border-white/20 bg-screenriot-bg px-3 py-2 text-sm text-white placeholder:text-screenriot-muted focus:border-screenriot-accent-blue focus:outline-none';

interface Step3Props {
  step3: NonNullable<SubmitProjectFormData['step3']>;
  error: string | null;
  onUpdateCast: (index: number, field: 'actorName' | 'actorEmail' | 'role', value: string) => void;
  onUpdateCrew: (index: number, field: 'name' | 'position' | 'email', value: string) => void;
  onAddCast: () => void;
  onAddCrew: () => void;
  onRemoveCast: (index: number) => void;
  onRemoveCrew: (index: number) => void;
  onSetStep3: (update: Partial<SubmitProjectFormData['step3']>) => void;
}

export function Step3CastCrew({
  step3,
  error,
  onUpdateCast,
  onUpdateCrew,
  onAddCast,
  onAddCrew,
  onRemoveCast,
  onRemoveCrew,
  onSetStep3,
}: Step3Props) {
  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">{STEP_3_SECTION.title}</h2>
      <div className="flex gap-3 rounded-lg border border-screenriot-accent-blue/30 bg-screenriot-accent-blue/10 p-3">
        <span
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-screenriot-accent-blue/20 text-white"
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.icons.info} alt="" width={20} height={20} className="h-5 w-5" />
        </span>
        <p className="text-sm text-white">{STEP_3_SECTION.infoText}</p>
      </div>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}

      {/* Cast */}
      <div>
        <h3 className="text-sm font-semibold text-white">{STEP_3_CAST.heading}</h3>
        {(step3.cast ?? []).map((row, i) => (
          <div key={i} className="mt-3 flex flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1 basis-40">
              <label className="block text-xs font-medium text-screenriot-muted">
                {STEP_3_CAST.actorName.label}
              </label>
              <input
                type="text"
                value={row.actorName ?? ''}
                onChange={(e) => onUpdateCast(i, 'actorName', e.target.value)}
                placeholder={STEP_3_CAST.actorName.placeholder}
                className={INPUT_CLASS}
              />
            </div>
            <div className="min-w-0 flex-1 basis-40">
              <label className="block text-xs font-medium text-screenriot-muted">
                {STEP_3_CAST.actorEmail.label}
              </label>
              <input
                type="email"
                value={row.actorEmail ?? ''}
                onChange={(e) => onUpdateCast(i, 'actorEmail', e.target.value)}
                placeholder={STEP_3_CAST.actorEmail.placeholder}
                className={INPUT_CLASS}
              />
            </div>
            <div className="min-w-0 flex-1 basis-40">
              <label className="block text-xs font-medium text-screenriot-muted">
                {STEP_3_CAST.role.label}
              </label>
              <input
                type="text"
                value={row.role ?? ''}
                onChange={(e) => onUpdateCast(i, 'role', e.target.value)}
                placeholder={STEP_3_CAST.role.placeholder || 'Role'}
                className={INPUT_CLASS}
              />
            </div>
            {(step3.cast ?? []).length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveCast(i)}
                className="rounded px-2 py-1.5 text-xs text-screenriot-muted hover:bg-white/10 hover:text-white"
                aria-label={`Remove cast member ${i + 1}`}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={onAddCast}
          className="mt-2 text-sm font-medium text-screenriot-accent-blue hover:underline"
        >
          {STEP_3_CAST.addButton}
        </button>
      </div>

      {/* Crew */}
      <div>
        <h3 className="text-sm font-semibold text-white">{STEP_3_CREW.heading}</h3>
        {(step3.crew ?? []).map((row, i) => (
          <div key={i} className="mt-3 flex flex-wrap items-end gap-3">
            <div className="min-w-0 flex-1 basis-32">
              <label className="block text-xs font-medium text-screenriot-muted">
                {STEP_3_CREW.name.label}
              </label>
              <input
                type="text"
                value={row.name}
                onChange={(e) => onUpdateCrew(i, 'name', e.target.value)}
                placeholder={STEP_3_CREW.name.placeholder}
                className={INPUT_CLASS}
              />
            </div>
            <div className="min-w-0 flex-1 basis-32">
              <label className="block text-xs font-medium text-screenriot-muted">
                {STEP_3_CREW.position.label}
              </label>
              <input
                type="text"
                value={row.position}
                onChange={(e) => onUpdateCrew(i, 'position', e.target.value)}
                placeholder={STEP_3_CREW.position.placeholder}
                className={INPUT_CLASS}
              />
            </div>
            <div className="min-w-0 flex-1 basis-40">
              <label className="block text-xs font-medium text-screenriot-muted">
                {STEP_3_CREW.email.label}
              </label>
              <input
                type="email"
                value={row.email}
                onChange={(e) => onUpdateCrew(i, 'email', e.target.value)}
                placeholder={STEP_3_CREW.email.placeholder}
                className={INPUT_CLASS}
              />
            </div>
            {(step3.crew ?? []).length > 1 && (
              <button
                type="button"
                onClick={() => onRemoveCrew(i)}
                className="rounded px-2 py-1.5 text-xs text-screenriot-muted hover:bg-white/10 hover:text-white"
                aria-label={`Remove crew member ${i + 1}`}
              >
                Remove
              </button>
            )}
          </div>
        ))}
        <button
          type="button"
          onClick={onAddCrew}
          className="mt-2 text-sm font-medium text-screenriot-accent-blue hover:underline"
        >
          {STEP_3_CREW.addButton}
        </button>
      </div>

      {/* Wishlist */}
      <div>
        <h3 className="text-sm font-semibold text-white">{STEP_3_WISHLIST.heading}</h3>
        <p className="mt-0.5 text-xs text-screenriot-muted">{STEP_3_WISHLIST.description}</p>
        <input
          type="text"
          value={step3.wishListCast}
          onChange={(e) =>
            onSetStep3({ cast: step3.cast, crew: step3.crew, wishListCast: e.target.value })
          }
          placeholder={STEP_3_WISHLIST.placeholder}
          className={`mt-2 ${INPUT_CLASS}`}
        />
      </div>
    </div>
  );
}
