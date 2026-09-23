import { LocalStorageExpenseRepository } from "./local-storage";
import type { ExpenseRepository } from "./types";

export type { ExpenseRepository } from "./types";

/**
 * The repository used across the app. Replace this line with an API-backed
 * implementation to move persistence to a server; components only import the
 * `ExpenseRepository` type and this instance via `useExpenses()`.
 */
export const expenseRepository: ExpenseRepository = new LocalStorageExpenseRepository();
