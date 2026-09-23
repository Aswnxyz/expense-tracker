"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { expenseRepository } from "@/lib/repository";
import type { Expense, ExpenseInput, ExpenseLoadStatus } from "@/lib/types";

interface ExpenseContextValue {
  expenses: Expense[];
  status: ExpenseLoadStatus;
  /** Message describing why loading failed; null while healthy. */
  error: string | null;
  /** True while a create/update/delete/clear operation is in flight. */
  isMutating: boolean;
  addExpense(input: ExpenseInput): Promise<void>;
  updateExpense(id: string, input: ExpenseInput): Promise<void>;
  deleteExpense(id: string): Promise<void>;
  /** Re-runs the initial load, surfacing the loading state first. */
  retry(): void;
  /** Clears stored data and reloads (recovery from corrupt storage). */
  clearStoredData(): Promise<void>;
}

const ExpenseContext = createContext<ExpenseContextValue | null>(null);

/**
 * Loads expenses once for the whole app and exposes CRUD actions, so the
 * dashboard and expense list always stay in sync after mutations.
 */
export function ExpenseProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [status, setStatus] = useState<ExpenseLoadStatus>("loading");
  const [error, setError] = useState<string | null>(null);
  const [isMutating, setIsMutating] = useState(false);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  /**
   * Fetches expenses and applies the result. State updates happen inside the
   * promise callbacks (not synchronously with any effect body), which is the
   * pattern `react-hooks/set-state-in-effect` expects for external data.
   */
  const load = useCallback(
    (): Promise<void> =>
      expenseRepository.getAll().then(
        (data) => {
          if (!isMountedRef.current) return;
          setExpenses(data);
          setError(null);
          setStatus("ready");
        },
        (loadError: unknown) => {
          if (!isMountedRef.current) return;
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Something went wrong while loading expenses.",
          );
          setStatus("error");
        },
      ),
    [],
  );

  useEffect(() => {
    void load();
  }, [load]);

  /** Re-runs the load from an event handler, showing the loading state first. */
  const retry = useCallback(() => {
    setStatus("loading");
    setError(null);
    void load();
  }, [load]);

  const runMutation = useCallback(async (mutation: () => Promise<void>) => {
    setIsMutating(true);
    try {
      await mutation();
    } finally {
      if (isMountedRef.current) setIsMutating(false);
    }
  }, []);

  // Mutations rethrow so the calling form/dialog can surface the failure
  // inline instead of replacing the whole page with an error state.
  const addExpense = useCallback(
    async (input: ExpenseInput) => {
      await runMutation(async () => {
        const created = await expenseRepository.create(input);
        if (isMountedRef.current) setExpenses((previous) => [...previous, created]);
      });
    },
    [runMutation],
  );

  const updateExpense = useCallback(
    async (id: string, input: ExpenseInput) => {
      await runMutation(async () => {
        const updated = await expenseRepository.update(id, input);
        if (isMountedRef.current) {
          setExpenses((previous) =>
            previous.map((expense) => (expense.id === id ? updated : expense)),
          );
        }
      });
    },
    [runMutation],
  );

  const deleteExpense = useCallback(
    async (id: string) => {
      await runMutation(async () => {
        await expenseRepository.remove(id);
        if (isMountedRef.current) {
          setExpenses((previous) => previous.filter((expense) => expense.id !== id));
        }
      });
    },
    [runMutation],
  );

  const clearStoredData = useCallback(async () => {
    await runMutation(async () => {
      try {
        await expenseRepository.clear();
      } catch (clearError) {
        if (isMountedRef.current && clearError instanceof Error) {
          setError(clearError.message);
          setStatus("error");
        }
        return;
      }
      await load();
    });
  }, [runMutation, load]);

  const value = useMemo<ExpenseContextValue>(
    () => ({
      expenses,
      status,
      error,
      isMutating,
      addExpense,
      updateExpense,
      deleteExpense,
      retry,
      clearStoredData,
    }),
    [
      expenses,
      status,
      error,
      isMutating,
      addExpense,
      updateExpense,
      deleteExpense,
      retry,
      clearStoredData,
    ],
  );

  return <ExpenseContext.Provider value={value}>{children}</ExpenseContext.Provider>;
}

/** Reads the shared expense state; must be used under an ExpenseProvider. */
export function useExpenses(): ExpenseContextValue {
  const context = useContext(ExpenseContext);
  if (!context) {
    throw new Error("useExpenses must be used within an ExpenseProvider.");
  }
  return context;
}
