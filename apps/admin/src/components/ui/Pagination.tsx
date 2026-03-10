const BTN =
  'rounded-md px-2.5 py-1.5 text-xs text-gray-400 transition-colors hover:bg-white/[0.06] hover:text-white disabled:pointer-events-none disabled:opacity-30';

type PaginationProps = {
  page: number;
  totalPages: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
};

export function Pagination({ page, totalPages, loading, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between">
      <p className="text-xs text-gray-500">
        Page {page} of {totalPages}
      </p>
      <div className="flex items-center gap-1">
        <button type="button" onClick={() => onPageChange(1)} disabled={page <= 1 || loading} className={BTN} aria-label="First page">
          ««
        </button>
        <button type="button" onClick={() => onPageChange(Math.max(1, page - 1))} disabled={page <= 1 || loading} className={BTN} aria-label="Previous page">
          ‹ Prev
        </button>
        <span className="px-3 py-1.5 text-xs font-medium text-white">{page}</span>
        <button type="button" onClick={() => onPageChange(Math.min(totalPages, page + 1))} disabled={page >= totalPages || loading} className={BTN} aria-label="Next page">
          Next ›
        </button>
        <button type="button" onClick={() => onPageChange(totalPages)} disabled={page >= totalPages || loading} className={BTN} aria-label="Last page">
          »»
        </button>
      </div>
    </div>
  );
}
