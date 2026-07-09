import type { FileSlot } from '@/types/films';

export function FileRow({
  label,
  file,
  missingHint,
}: {
  label: string;
  file: FileSlot;
  /** Shown next to "Not uploaded" to explain likely causes (format/size) - the filmmaker's
   * upload attempt isn't recorded server-side if it was rejected, so this is guidance, not a
   * specific failure reason. */
  missingHint?: string;
}) {
  return (
    <li className="flex items-center justify-between gap-3 rounded-md bg-white/[0.03] px-3 py-2">
      <span className="flex items-center gap-2 text-sm text-gray-300">
        <span className={`h-1.5 w-1.5 rounded-full ${file ? 'bg-emerald-400' : 'bg-gray-600'}`} />
        {label}
      </span>
      {file ? (
        <a
          href={file.url}
          target="_blank"
          rel="noreferrer"
          className="rounded bg-admin-accent/10 px-2.5 py-0.5 text-xs font-medium text-admin-accent transition-colors hover:bg-admin-accent/20"
        >
          Open
        </a>
      ) : (
        <span className="text-xs text-gray-600" title={missingHint}>
          Not uploaded{missingHint ? ' (hover for requirements)' : ''}
        </span>
      )}
    </li>
  );
}
