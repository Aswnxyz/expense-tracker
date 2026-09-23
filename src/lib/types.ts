/** All categories an expense can belong to. */
export const EXPENSE_CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Entertainment",
  "Bills",
  "Health",
  "Other",
] as const;

export type ExpenseCategory = (typeof EXPENSE_CATEGORIES)[number];

/** A single persisted expense record. */
export interface Expense {
  id: string;
  title: string;
  /** Decimal amount in the user's currency, always greater than zero. */
  amount: number;
  category: ExpenseCategory;
  /** ISO calendar date, e.g. "2026-09-23". */
  date: string;
  description?: string;
  /** ISO timestamp of record creation. */
  createdAt: string;
  /** ISO timestamp of the last update. */
  updatedAt: string;
}

/** Data required to create or update an expense; the repository owns the rest. */
export type ExpenseInput = Omit<Expense, "id" | "createdAt" | "updatedAt">;

/** Wildcard value for the category filter. */
export const ALL_CATEGORIES = "All";
export type ExpenseCategoryFilter = ExpenseCategory | typeof ALL_CATEGORIES;

/** User-selected filtering criteria for the expense list. */
export interface ExpenseFilters {
  /** Free-text query matched against title and description. */
  query: string;
  category: ExpenseCategoryFilter;
  /** Inclusive ISO lower date bound, or "" when unset. */
  fromDate: string;
  /** Inclusive ISO upper date bound, or "" when unset. */
  toDate: string;
}

export type ExpenseSortKey = "date" | "title" | "amount";
export type SortDirection = "asc" | "desc";

export interface ExpenseSort {
  key: ExpenseSortKey;
  direction: SortDirection;
}

export const DEFAULT_EXPENSE_FILTERS: ExpenseFilters = {
  query: "",
  category: ALL_CATEGORIES,
  fromDate: "",
  toDate: "",
};

export const DEFAULT_EXPENSE_SORT: ExpenseSort = { key: "date", direction: "desc" };

/** Lifecycle of the initial expense load. */
export type ExpenseLoadStatus = "loading" | "ready" | "error";

/** Aggregated figures shown on the dashboard. */
export interface DashboardStats {
  totalAmount: number;
  transactionCount: number;
  highestAmount: number;
  averageAmount: number;
}

/** One category's share of total spending. */
export interface CategoryBreakdownEntry {
  category: ExpenseCategory;
  total: number;
  count: number;
  /** Share of total spending, 0–100, rounded to one decimal. */
  percentage: number;
}
