'use client';

interface ActionAlertModalProps {
  title: string;
  message: string;
  onClose: () => void;
  confirmLabel?: string;
}

export function ActionAlertModal({
  title,
  message,
  onClose,
  confirmLabel = 'OK',
}: ActionAlertModalProps) {
  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="alertdialog"
      aria-modal="true"
      aria-labelledby="action-alert-title"
      aria-describedby="action-alert-desc"
    >
      <div className="absolute inset-0 bg-black/70" aria-hidden="true" onClick={onClose} />
      <div className="relative w-full max-w-md rounded-xl border border-red-500/30 bg-screenriot-bg-card p-6 shadow-xl">
        <h2 id="action-alert-title" className="text-lg font-semibold text-white">
          {title}
        </h2>
        <p id="action-alert-desc" className="mt-2 text-sm text-gray-300">
          {message}
        </p>
        <button
          type="button"
          onClick={onClose}
          className="mt-6 w-full rounded-lg bg-screenriot-accent-blue px-4 py-2.5 text-sm font-medium text-white transition-opacity hover:opacity-95 focus:outline-none focus:ring-2 focus:ring-screenriot-accent-blue focus:ring-offset-2 focus:ring-offset-screenriot-bg"
        >
          {confirmLabel}
        </button>
      </div>
    </div>
  );
}
