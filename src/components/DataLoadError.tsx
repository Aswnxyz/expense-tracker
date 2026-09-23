"use client";

import { Button } from "@/components/ui/Button";
import { ErrorState } from "@/components/ui/ErrorState";
import { useExpenses } from "@/providers/expense-provider";

/**
 * Error state wired to the expense store: offers retry, plus clearing the
 * locally saved data when the stored payload itself is unusable.
 */
export function DataLoadError({ className }: { className?: string }) {
  const { error, retry, clearStoredData } = useExpenses();

  return (
    <ErrorState
      className={className}
      message={error ?? "Expenses could not be loaded."}
      action={
        <>
          <Button onClick={() => void retry()}>Try again</Button>
          <Button variant="secondary" onClick={() => void clearStoredData()}>
            Clear saved data
          </Button>
        </>
      }
    />
  );
}
