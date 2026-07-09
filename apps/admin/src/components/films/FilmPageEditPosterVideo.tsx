import { useState } from 'react';
import type { AdminFilmDetail } from '@/types/films';

type Props = {
  detail: AdminFilmDetail;
  uploadingSlot: 'poster' | 'teaser' | null;
  onFileUpload: (slot: 'poster' | 'teaser', file: File) => void;
};

/** Matches the API's FILE_SLOT_RULES for these slots (apps/api/src/films/films.service.ts). */
const SLOT_RULES = {
  poster: { label: 'Poster', maxSizeBytes: 10 * 1024 * 1024, mimeTypes: ['image/jpeg', 'image/png', 'image/webp'] },
  teaser: { label: 'Teaser video', maxSizeBytes: 100 * 1024 * 1024, mimeTypes: ['video/mp4'] },
} as const;

function validateFile(slot: 'poster' | 'teaser', file: File): string | null {
  const rule = SLOT_RULES[slot];
  if (file.size > rule.maxSizeBytes) {
    const maxMb = Math.round(rule.maxSizeBytes / (1024 * 1024));
    const gotMb = (file.size / (1024 * 1024)).toFixed(1);
    return `${rule.label} is too large (${gotMb}MB). Maximum allowed size is ${maxMb}MB.`;
  }
  if (!(rule.mimeTypes as readonly string[]).includes(file.type)) {
    return `${rule.label} must be ${rule.mimeTypes.join(' or ')} (selected file is ${file.type || 'an unrecognized format'}).`;
  }
  return null;
}

export function FilmPageEditPosterVideo({
  detail,
  uploadingSlot,
  onFileUpload,
}: Props) {
  const [localError, setLocalError] = useState<string | null>(null);

  function handleChange(slot: 'poster' | 'teaser', file: File | undefined) {
    if (!file) return;
    const validationError = validateFile(slot, file);
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    onFileUpload(slot, file);
  }
  return (
    <section
      className="mt-8 rounded-xl border border-white/10 bg-admin-sidebar/50 px-5 py-5"
      aria-labelledby="section-poster-video"
    >
      <h2
        id="section-poster-video"
        className="mb-3 text-base font-semibold text-white"
      >
        Poster & video (storage)
      </h2>
      <p className="mb-3 text-xs text-gray-500">
        Same paths as application. Upload overwrites existing file. If the
        filmmaker already uploaded, you can replace here.
      </p>
      {localError && (
        <p className="mb-3 text-xs text-red-400" role="alert">
          {localError}
        </p>
      )}
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="rounded-md border border-white/10 bg-admin-sidebar p-3">
          <p className="mb-2 text-xs font-medium text-gray-400">Poster</p>
          {detail.files.poster?.url ? (
            <div className="mb-2">
              <a
                href={detail.files.poster.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-admin-accent hover:underline"
              >
                View current
              </a>
              <p className="mt-1 text-xs text-gray-500">
                Upload new file to replace.
              </p>
            </div>
          ) : (
            <p className="mb-2 text-xs text-gray-500">
              No file. Upload from application or here.
            </p>
          )}
          <input
            type="file"
            accept="image/*"
            className="mb-2 block w-full text-xs text-gray-400 file:mr-2 file:rounded file:border-0 file:bg-admin-accent file:px-3 file:py-1 file:text-sm file:text-white"
            onChange={(e) => {
              handleChange('poster', e.target.files?.[0]);
              e.target.value = '';
            }}
            disabled={uploadingSlot === 'poster'}
            aria-label="Upload poster image"
          />
          {uploadingSlot === 'poster' && (
            <span className="text-xs text-gray-500">Uploading…</span>
          )}
        </div>
        <div className="rounded-md border border-white/10 bg-admin-sidebar p-3">
          <p className="mb-2 text-xs font-medium text-gray-400">
            Teaser (video)
          </p>
          {detail.files.teaser?.url ? (
            <div className="mb-2">
              <a
                href={detail.files.teaser.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs text-admin-accent hover:underline"
              >
                View current
              </a>
              <p className="mt-1 text-xs text-gray-500">
                Upload new file to replace.
              </p>
            </div>
          ) : (
            <p className="mb-2 text-xs text-gray-500">
              No file. Upload from application or here.
            </p>
          )}
          <input
            type="file"
            accept="video/*"
            className="mb-2 block w-full text-xs text-gray-400 file:mr-2 file:rounded file:border-0 file:bg-admin-accent file:px-3 file:py-1 file:text-sm file:text-white"
            onChange={(e) => {
              handleChange('teaser', e.target.files?.[0]);
              e.target.value = '';
            }}
            disabled={uploadingSlot === 'teaser'}
            aria-label="Upload teaser video"
          />
          {uploadingSlot === 'teaser' && (
            <span className="text-xs text-gray-500">Uploading…</span>
          )}
        </div>
      </div>
    </section>
  );
}
