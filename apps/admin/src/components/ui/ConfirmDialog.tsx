type ConfirmDialogProps = {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
  onCancel: () => void;
};

export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4"
      onClick={onCancel}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-message"
        className="w-full max-w-sm rounded-xl border border-white/10 bg-admin-sidebar p-5 shadow-xl"
        onClick={(e) => e.stopPropagation()}
      >
        <h2 id="confirm-dialog-title" className="text-base font-semibold text-white">
          {title}
        </h2>
        <p id="confirm-dialog-message" className="mt-2 text-sm text-gray-400">
          {message}
        </p>
        <div className="mt-5 flex justify-end gap-2">
          <button
            type="button"
            onClick={onCancel}
            className="rounded px-3 py-1.5 text-sm font-medium text-gray-300 hover:bg-white/10"
          >
            {cancelLabel}
          </button>
          <button
            type="button"
            onClick={onConfirm}
            autoFocus
            className={
              tone === 'danger'
                ? 'rounded bg-red-500/20 px-3 py-1.5 text-sm font-medium text-red-300 hover:bg-red-500/30'
                : 'rounded bg-admin-accent/20 px-3 py-1.5 text-sm font-medium text-admin-accent hover:bg-admin-accent/30'
            }
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
