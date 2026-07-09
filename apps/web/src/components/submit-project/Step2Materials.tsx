import { IMAGES } from '@/lib/constants';
import {
  STEP_2_SECTION,
  STEP_2_UPLOADS,
  AI_SCRIPT_ANALYSIS,
} from '@/markup/submit-project';
import type { SubmitProjectFormData, Step2Files } from '@/types/submit-project';
import type { UseFormReturn } from 'react-hook-form';

interface Step2Props {
  form: UseFormReturn<SubmitProjectFormData>;
  files: Step2Files;
  error: string | null;
  onFilesChange: React.Dispatch<React.SetStateAction<Step2Files>>;
  onClearError: () => void;
}

export function Step2Materials({ form, files, error, onFilesChange, onClearError }: Step2Props) {
  const step2Values = form.watch('step2');

  return (
    <div className="space-y-6">
      <h2 className="text-lg font-semibold text-white">{STEP_2_SECTION.title}</h2>
      {error && (
        <p className="text-sm text-red-400" role="alert">
          {error}
        </p>
      )}
      {STEP_2_UPLOADS.map((upload) => {
        const file =
          upload.id === 'screenplay'
            ? files.screenplay
            : upload.id === 'poster'
              ? files.poster
              : files.video;
        const serverFileName =
          upload.id === 'screenplay'
            ? step2Values?.screenplayFileName
            : upload.id === 'poster'
              ? step2Values?.posterFileName
              : step2Values?.videoFileName;
        const displayName = file?.name ?? serverFileName;

        const setFile = (f: File | null) => {
          const key = upload.id === 'screenplay' ? 'screenplay' : upload.id === 'poster' ? 'poster' : 'video';
          onFilesChange((p) => ({ ...p, [key]: f }));
        };

        const inputId = `upload-${upload.id}`;
        return (
          <div key={upload.id}>
            <label className="block text-sm font-medium text-white">
              {upload.label} {upload.required ? '*' : ''}
            </label>
            <p className="mt-0.5 text-xs text-screenriot-muted">{upload.format}</p>
            <div
              className="mt-2 flex flex-col items-center justify-center rounded-lg border-2 border-dashed border-white/20 bg-screenriot-bg py-6 px-4"
              onClick={() => document.getElementById(inputId)?.click()}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  document.getElementById(inputId)?.click();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Choose file for ${upload.label}`}
            >
              <input
                id={inputId}
                type="file"
                accept={upload.accept}
                className="sr-only"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  onClearError();
                }}
              />
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={IMAGES.icons.arrowUp} alt="" width={32} height={32} className="h-8 w-8 text-screenriot-muted" />
              <button
                type="button"
                className="mt-2 rounded bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/15 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue"
                onClick={(e) => {
                  e.stopPropagation();
                  document.getElementById(inputId)?.click();
                }}
              >
                Choose File
              </button>
              {displayName && (
                <p className="mt-2 max-w-full truncate text-xs text-screenriot-muted">
                  {displayName}
                </p>
              )}
            </div>
            {serverFileName && !file && (
              <p className="mt-2 flex items-center gap-1.5 text-xs font-medium text-green-400">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={IMAGES.icons.checkVerified} alt="" width={14} height={14} className="h-3.5 w-3.5" />
                Already uploaded - choose a new file only to replace it.
              </p>
            )}
          </div>
        );
      })}
      <div className="flex gap-4 rounded-lg border border-white/10 bg-screenriot-bg p-4">
        <span
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-screenriot-accent-blue/20 text-white"
          aria-hidden
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={IMAGES.icons.spark} alt="" width={24} height={24} className="h-6 w-6" />
        </span>
        <div>
          <h3 className="font-semibold text-white">{AI_SCRIPT_ANALYSIS.title}</h3>
          <p className="mt-1 text-sm text-screenriot-muted">{AI_SCRIPT_ANALYSIS.description}</p>
        </div>
      </div>
    </div>
  );
}
