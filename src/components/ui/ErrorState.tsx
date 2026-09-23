import type { ReactNode } from "react";
import { cn } from "@/lib/cn";
import { AlertTriangleIcon } from "./Icons";

interface ErrorStateProps {
  message: string;
  /** Buttons for recovery actions, e.g. retry or clear data. */
  action?: ReactNode;
  className?: string;
}

/** Full-width error panel used when loading data fails. */
export function ErrorState({ message, action, className }: ErrorStateProps) {
  return (
    <div
      role="alert"
      className={cn(
        "flex flex-col items-center justify-center gap-3 rounded-xl border border-rose-200 bg-rose-50 px-6 py-10 text-center",
        className,
      )}
    >
      <span className="flex size-10 items-center justify-center rounded-full bg-rose-100 text-rose-600">
        <AlertTriangleIcon className="size-5" />
      </span>
      <div>
        <h3 className="text-sm font-semibold text-rose-900">Something went wrong</h3>
        <p className="mt-1 max-w-md text-sm text-rose-700">{message}</p>
      </div>
      {action ? <div className="mt-1 flex flex-wrap justify-center gap-3">{action}</div> : null}
    </div>
  );
}
