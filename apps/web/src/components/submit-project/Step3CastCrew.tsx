import { IMAGES } from '@/lib/constants';
import { CAST_TIER_VALUES, CAST_TIER_LABELS, type CastTier } from '@/lib/cast-members';
import {
  STEP_3_SECTION,
  STEP_3_CAST,
  STEP_3_CREW,
  STEP_3_WISHLIST,
} from '@/markup/submit-project';
import type { SubmitProjectFormData } from '@/types/submit-project';

const INPUT_CLASS =
  'mt-1 w-full rounded-lg border border-white/20 bg-screenriot-bg px-3 py-2 text-sm text-white placeholder:text-screenriot-muted focus:border-screenriot-accent-blue focus:outline-none';

const TEXTAREA_CLASS = `${INPUT_CLASS} min-h-[72px] resize-y`;

interface Step3Props {
  step3: NonNullable<SubmitProjectFormData['step3']>;
  error: string | null;
  onUpdateCast: (
    index: number,
    field: keyof NonNullable<SubmitProjectFormData['step3']>['cast'][number],
    value: string,
  ) => void;
  onUpdateWishList: (
    index: number,
    field: keyof NonNullable<SubmitProjectFormData['step3']>['wishListCast'][number],
    value: string,
  ) => void;
  onToggleWishListStatus: (index: number) => void;
  onUpdateCrew: (index: number, field: 'name' | 'position' | 'email', value: string) => void;
  onAddCast: () => void;
  onAddWishList: () => void;
  onAddCrew: () => void;
  onRemoveCast: (index: number) => void;
  onRemoveWishList: (index: number) => void;
  onRemoveCrew: (index: number) => void;
}

function TierSelect({
  id,
  value,
  onChange,
}: {
  id: string;
  value: CastTier;
  onChange: (tier: CastTier) => void;
}) {
  return (
    <select
      id={id}
      value={value}
      onChange={(e) => onChange(e.target.value as CastTier)}
      className={INPUT_CLASS}
    >
      {CAST_TIER_VALUES.map((tier) => (
        <option key={tier} value={tier}>
          {CAST_TIER_LABELS[tier]}
        </option>
      ))}
    </select>
  );
}

export function Step3CastCrew({
  step3,
  error,
  onUpdateCast,
  onUpdateWishList,
  onToggleWishListStatus,
  onUpdateCrew,
  onAddCast,
  onAddWishList,
  onAddCrew,
  onRemoveCast,
  onRemoveWishList,
  onRemoveCrew,
}: Step3Props) {
  const wishList = step3.wishListCast ?? [];

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

      {/* Key cast (verified) */}
      <div>
        <h3 className="text-sm font-semibold text-white">{STEP_3_CAST.heading}</h3>
        <p className="mt-0.5 text-xs text-screenriot-muted">{STEP_3_CAST.subheading}</p>
        {(step3.cast ?? []).map((row, i) => (
          <div
            key={i}
            className="mt-4 space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-4"
          >
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-0 flex-1 basis-40">
                <label htmlFor={`cast-name-${i}`} className="block text-xs font-medium text-screenriot-muted">
                  {STEP_3_CAST.actorName.label}
                </label>
                <input
                  id={`cast-name-${i}`}
                  type="text"
                  value={row.actorName ?? ''}
                  onChange={(e) => onUpdateCast(i, 'actorName', e.target.value)}
                  placeholder={STEP_3_CAST.actorName.placeholder}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="min-w-0 flex-1 basis-40">
                <label htmlFor={`cast-char-${i}`} className="block text-xs font-medium text-screenriot-muted">
                  {STEP_3_CAST.character.label}
                </label>
                <input
                  id={`cast-char-${i}`}
                  type="text"
                  value={row.character ?? ''}
                  onChange={(e) => onUpdateCast(i, 'character', e.target.value)}
                  placeholder={STEP_3_CAST.character.placeholder}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="min-w-0 flex-1 basis-36">
                <label htmlFor={`cast-tier-${i}`} className="block text-xs font-medium text-screenriot-muted">
                  {STEP_3_CAST.tier.label}
                </label>
                <TierSelect
                  id={`cast-tier-${i}`}
                  value={row.tier ?? 'lead'}
                  onChange={(tier) => onUpdateCast(i, 'tier', tier)}
                />
              </div>
              <div className="min-w-0 flex-1 basis-44">
                <label htmlFor={`cast-email-${i}`} className="block text-xs font-medium text-screenriot-muted">
                  {STEP_3_CAST.actorEmail.label}
                </label>
                <input
                  id={`cast-email-${i}`}
                  type="email"
                  value={row.actorEmail ?? ''}
                  onChange={(e) => onUpdateCast(i, 'actorEmail', e.target.value)}
                  placeholder={STEP_3_CAST.actorEmail.placeholder}
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
            <div>
              <label
                htmlFor={`cast-desc-${i}`}
                className="block text-xs font-medium text-screenriot-muted"
              >
                {STEP_3_CAST.characterDescription.label} *
              </label>
              <textarea
                id={`cast-desc-${i}`}
                value={row.characterDescription ?? ''}
                onChange={(e) => onUpdateCast(i, 'characterDescription', e.target.value)}
                placeholder={STEP_3_CAST.characterDescription.placeholder}
                className={TEXTAREA_CLASS}
                rows={2}
              />
            </div>
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

      {/* Wish list */}
      <div>
        <h3 className="text-sm font-semibold text-white">{STEP_3_WISHLIST.heading}</h3>
        <p className="mt-0.5 text-xs text-screenriot-muted">{STEP_3_WISHLIST.description}</p>
        {wishList.map((row, i) => (
          <div
            key={i}
            className="mt-4 space-y-3 rounded-lg border border-white/10 bg-white/[0.02] p-4"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span
                className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-medium ${
                  row.status === 'verified'
                    ? 'bg-green-500/20 text-green-400'
                    : 'bg-screenriot-accent-blue/20 text-blue-300'
                }`}
              >
                {row.status === 'verified'
                  ? STEP_3_WISHLIST.statusVerified
                  : STEP_3_WISHLIST.statusWishList}
              </span>
              <div className="flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={() => onToggleWishListStatus(i)}
                  className="rounded px-2 py-1 text-xs font-medium text-screenriot-accent-blue hover:bg-white/10 hover:underline"
                >
                  {row.status === 'verified'
                    ? STEP_3_WISHLIST.markWishList
                    : STEP_3_WISHLIST.markVerified}
                </button>
                <button
                  type="button"
                  onClick={() => onRemoveWishList(i)}
                  className="rounded px-2 py-1.5 text-xs text-screenriot-muted hover:bg-white/10 hover:text-white"
                  aria-label={`Remove wish list member ${i + 1}`}
                >
                  Remove
                </button>
              </div>
            </div>
            <div className="flex flex-wrap items-end gap-3">
              <div className="min-w-0 flex-1 basis-40">
                <label htmlFor={`wish-name-${i}`} className="block text-xs font-medium text-screenriot-muted">
                  {STEP_3_WISHLIST.actorName.label}
                </label>
                <input
                  id={`wish-name-${i}`}
                  type="text"
                  value={row.actorName ?? ''}
                  onChange={(e) => onUpdateWishList(i, 'actorName', e.target.value)}
                  placeholder={STEP_3_WISHLIST.actorName.placeholder}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="min-w-0 flex-1 basis-40">
                <label htmlFor={`wish-char-${i}`} className="block text-xs font-medium text-screenriot-muted">
                  {STEP_3_WISHLIST.character.label}
                </label>
                <input
                  id={`wish-char-${i}`}
                  type="text"
                  value={row.character ?? ''}
                  onChange={(e) => onUpdateWishList(i, 'character', e.target.value)}
                  placeholder={STEP_3_WISHLIST.character.placeholder}
                  className={INPUT_CLASS}
                />
              </div>
              <div className="min-w-0 flex-1 basis-36">
                <label htmlFor={`wish-tier-${i}`} className="block text-xs font-medium text-screenriot-muted">
                  {STEP_3_WISHLIST.tier.label}
                </label>
                <TierSelect
                  id={`wish-tier-${i}`}
                  value={row.tier ?? 'lead'}
                  onChange={(tier) => onUpdateWishList(i, 'tier', tier)}
                />
              </div>
            </div>
            <div>
              <label htmlFor={`wish-desc-${i}`} className="block text-xs font-medium text-screenriot-muted">
                {STEP_3_WISHLIST.characterDescription.label}
              </label>
              <textarea
                id={`wish-desc-${i}`}
                value={row.characterDescription ?? ''}
                onChange={(e) => onUpdateWishList(i, 'characterDescription', e.target.value)}
                placeholder={STEP_3_WISHLIST.characterDescription.placeholder}
                className={TEXTAREA_CLASS}
                rows={2}
              />
            </div>
          </div>
        ))}
        <button
          type="button"
          onClick={onAddWishList}
          className="mt-2 text-sm font-medium text-screenriot-accent-blue hover:underline"
        >
          {STEP_3_WISHLIST.addButton}
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
    </div>
  );
}
