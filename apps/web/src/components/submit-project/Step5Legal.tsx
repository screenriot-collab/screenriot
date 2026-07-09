import { IMAGES } from '@/lib/constants';
import {
  SUBMIT_STEPS,
  STEP_5_CHAIN_OF_TITLE,
  STEP_5_LEGAL,
  STEP_5_FEE,
  STEP_5_NEXT,
} from '@/markup/submit-project';
import type { SubmitProjectFormData, Step5Files } from '@/types/submit-project';
import type { UseFormReturn } from 'react-hook-form';

type Step5Data = NonNullable<SubmitProjectFormData['step5']>;

interface Step5Props {
  form: UseFormReturn<SubmitProjectFormData>;
  step5: Step5Data;
  files: Step5Files;
  error: string | null;
  submissionFeePaid: boolean;
  onSetStep5: (update: Partial<Step5Data>) => void;
  onFilesChange: React.Dispatch<React.SetStateAction<Step5Files>>;
  onClearError: () => void;
}

export function Step5Legal({
  form,
  step5,
  files,
  error,
  submissionFeePaid,
  onSetStep5,
  onFilesChange,
  onClearError,
}: Step5Props) {
  return (
    <div className="space-y-8">
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      <h2 className="text-lg font-semibold text-white">{SUBMIT_STEPS[4].label}</h2>

      {/* Chain of Title */}
      <div>
        <label className="block text-sm font-medium text-white">
          {STEP_5_CHAIN_OF_TITLE.label} *
        </label>
        <p className="mt-0.5 text-xs text-screenriot-muted">{STEP_5_CHAIN_OF_TITLE.description}</p>
        <label className="mt-2 flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-white/5 py-8 transition hover:border-white/30 focus-within:border-screenriot-accent-blue">
          <input
            type="file"
            accept={STEP_5_CHAIN_OF_TITLE.accept}
            className="sr-only"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) onFilesChange((prev) => ({ ...prev, chainOfTitle: f }));
              onClearError();
            }}
            aria-label="Upload copyright documentation"
          />
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.icons.arrowUp} alt="" width={32} height={32} className="h-8 w-8 text-screenriot-muted" />
          <span className="mt-2 text-sm text-white">
            {files.chainOfTitle?.name ??
              form.watch('step5')?.chainOfTitleFileName ??
              STEP_5_CHAIN_OF_TITLE.buttonText}
          </span>
          <span className="mt-0.5 text-xs text-screenriot-muted">{STEP_5_CHAIN_OF_TITLE.format}</span>
          <span className="mt-2 rounded bg-white/10 px-3 py-1.5 text-xs text-white">Choose File</span>
        </label>
        {step5.chainOfTitleFileName && !files.chainOfTitle && (
          <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-green-400">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={IMAGES.icons.checkVerified} alt="" width={14} height={14} className="h-3.5 w-3.5" />
            Already uploaded - choose a new file only to replace it.
          </p>
        )}
      </div>

      {/* Legal Agreements */}
      <div>
        <label className="block text-sm font-medium text-white">{STEP_5_LEGAL.label} *</label>
        <div className="mt-3 space-y-4">
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={step5.agreeTerms}
              onChange={(e) => onSetStep5({ agreeTerms: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-white/30 bg-screenriot-bg text-screenriot-accent-blue focus:ring-screenriot-accent-blue"
            />
            <span className="text-sm text-white">
              {STEP_5_LEGAL.termsLabel}{' '}
              <a
                href="#"
                className="text-screenriot-accent-blue underline hover:no-underline"
                onClick={(e) => e.preventDefault()}
              >
                {STEP_5_LEGAL.termsLink}
              </a>
            </span>
          </label>
          <label className="flex cursor-pointer items-start gap-3">
            <input
              type="checkbox"
              checked={step5.agreeAgreement}
              onChange={(e) => onSetStep5({ agreeAgreement: e.target.checked })}
              className="mt-1 h-4 w-4 rounded border-white/30 bg-screenriot-bg text-screenriot-accent-blue focus:ring-screenriot-accent-blue"
            />
            <span className="text-sm text-white">
              {STEP_5_LEGAL.agreementLabel}{' '}
              <a
                href="#"
                className="text-screenriot-accent-blue underline hover:no-underline"
                onClick={(e) => e.preventDefault()}
              >
                {STEP_5_LEGAL.agreementLink}
              </a>
            </span>
          </label>
        </div>
      </div>

      {/* Submission Fee */}
      {!submissionFeePaid && (
        <div className="rounded-lg border border-white/10 bg-screenriot-bg-card p-5">
          <h3 className="text-sm font-medium text-white">{STEP_5_FEE.label}</h3>
          <p className="mt-1 text-xs text-screenriot-muted">{STEP_5_FEE.description}</p>
          <p className="mt-3 text-xs font-medium text-screenriot-muted">{STEP_5_FEE.clarification}</p>
          <p className="mt-3 text-2xl font-semibold text-white">
            {step5.currency === 'USD' ? STEP_5_FEE.amountUSD : STEP_5_FEE.amountGBP}
          </p>
          <div className="mt-3 flex gap-4">
            {STEP_5_FEE.options.map((opt) => (
              <label key={opt.id} className="flex cursor-pointer items-center gap-2">
                <input
                  type="radio"
                  name="fee-currency"
                  checked={step5.currency === opt.id}
                  onChange={() => onSetStep5({ currency: opt.id })}
                  className="h-4 w-4 border-white/30 bg-screenriot-bg text-screenriot-accent-blue focus:ring-screenriot-accent-blue"
                />
                <span className="text-sm text-white">{opt.label}</span>
              </label>
            ))}
          </div>
        </div>
      )}

      {/* What Happens Next */}
      <div className="rounded-lg border border-white/10 bg-screenriot-bg-card p-5">
        <h3 className="text-sm font-medium text-white">{STEP_5_NEXT.title}</h3>
        <ul className="mt-3 list-none space-y-2 pl-0">
          {STEP_5_NEXT.items.map((item, i) => (
            <li key={i} className="flex items-start gap-2 text-sm text-screenriot-muted">
              <span className="mt-0.5 shrink-0 text-screenriot-accent-blue" aria-hidden>
                <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                  <circle cx="10" cy="10" r="9" stroke="currentColor" strokeWidth="2" />
                  <path
                    d="M6 10l3 3 5-6"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
