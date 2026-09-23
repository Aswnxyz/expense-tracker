import type { Expense, ExpenseInput } from "../types";

/**
 * Data-access seam for expenses.
 *
 * The UI only ever depends on this interface, so a database- or API-backed
 * implementation can replace the localStorage one without touching any
 * component — swap the instance exported from `./index` and nothing else.
 *
 * All methods are async to mirror a real data source, which also gives the UI
 * honest loading and pending states.
 */
export interface ExpenseRepository {
  /** Returns every expense, newest records last. */
  getAll(): Promise<Expense[]>;
  /** Persists a new expense and returns the stored record. */
  create(input: ExpenseInput): Promise<Expense>;
  /** Updates an existing expense; rejects when the id does not exist. */
  update(id: string, input: ExpenseInput): Promise<Expense>;
  /** Deletes an expense; rejects when the id does not exist. */
  remove(id: string): Promise<void>;
  /** Deletes all stored expenses (used for error recovery). */
  clear(): Promise<void>;
}
