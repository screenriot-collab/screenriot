import { useState } from 'react';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';

type ConfirmOptions = {
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  tone?: 'default' | 'danger';
  onConfirm: () => void;
};

/** Renders `dialog` wherever the calling component places it; call `requestConfirm` in place of `window.confirm`. */
export function useConfirmDialog() {
  const [pending, setPending] = useState<ConfirmOptions | null>(null);

  function requestConfirm(options: ConfirmOptions) {
    setPending(options);
  }

  const dialog = (
    <ConfirmDialog
      open={pending !== null}
      title={pending?.title ?? ''}
      message={pending?.message ?? ''}
      confirmLabel={pending?.confirmLabel}
      cancelLabel={pending?.cancelLabel}
      tone={pending?.tone}
      onConfirm={() => {
        pending?.onConfirm();
        setPending(null);
      }}
      onCancel={() => setPending(null)}
    />
  );

  return { requestConfirm, dialog };
}
