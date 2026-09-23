import type { ReactNode } from "react";
import { AlertTriangleIcon } from "@/components/ui/Icons";
import { Button } from "@/components/ui/Button";
import { Modal } from "@/components/ui/Modal";

interface ConfirmDialogProps {
  open: boolean;
  title: string;
  message: ReactNode;
  confirmLabel?: string;
  /** Error from a failed confirm action, shown inside the dialog. */
  error?: string | null;
  busy?: boolean;
  onConfirm(): void;
  onCancel(): void;
}

/** Destructive-action confirmation built on top of Modal. */
export function ConfirmDialog({
  open,
  title,
  message,
  confirmLabel = "Confirm",
  error,
  busy = false,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  return (
    <Modal
      open={open}
      onClose={onCancel}
      title={title}
      busy={busy}
      className="sm:max-w-md"
      footer={
        <>
          <Button variant="secondary" onClick={onCancel} disabled={busy}>
            Cancel
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={busy}>
            {confirmLabel}
          </Button>
        </>
      }
    >
      <div className="space-y-3 text-sm leading-6 text-zinc-600">{message}</div>
      {error ? (
        <p
          role="alert"
          className="mt-4 flex items-start gap-2 rounded-lg border border-rose-200 bg-rose-50 px-3 py-2 text-sm text-rose-700"
        >
          <AlertTriangleIcon className="mt-0.5 size-4 shrink-0" />
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
