import type { AdminFilmDetail } from '@/types/films';

type Props = {
  detail: AdminFilmDetail;
  uploadingSlot: 'poster' | 'teaser' | null;
  onFileUpload: (slot: 'poster' | 'teaser', file: File) => void;
};

export function FilmPageEditPosterVideo({
  detail,
  uploadingSlot,
  onFileUpload,
}: Props) {
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
              const f = e.target.files?.[0];
              if (f) void onFileUpload('poster', f);
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
              const f = e.target.files?.[0];
              if (f) void onFileUpload('teaser', f);
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
