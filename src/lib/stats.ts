import { roundCurrency } from "./format";
import {
  ALL_CATEGORIES,
  type CategoryBreakdownEntry,
  type DashboardStats,
  type Expense,
  type ExpenseCategory,
  type ExpenseFilters,
  type ExpenseSort,
} from "./types";

/** Applies search, category, and inclusive date-range filters. */
export function filterExpenses(expenses: Expense[], filters: ExpenseFilters): Expense[] {
  const query = filters.query.trim().toLowerCase();
  if (!query && filters.category === ALL_CATEGORIES && !filters.fromDate && !filters.toDate) {
    return expenses;
  }

  return expenses.filter((expense) => {
    if (filters.category !== ALL_CATEGORIES && expense.category !== filters.category) {
      return false;
    }
    if (filters.fromDate && expense.date < filters.fromDate) return false;
    if (filters.toDate && expense.date > filters.toDate) return false;
    if (query) {
      const haystack = `${expense.title} ${expense.description ?? ""}`.toLowerCase();
      if (!haystack.includes(query)) return false;
    }
    return true;
  });
}

/** Returns a sorted copy of the list; ties on date fall back to creation time. */
export function sortExpenses(expenses: Expense[], sort: ExpenseSort): Expense[] {
  return [...expenses].sort((a, b) => {
    let comparison = 0;
    switch (sort.key) {
      case "date":
        comparison = a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt);
        break;
      case "title":
        comparison = a.title.localeCompare(b.title, undefined, { sensitivity: "base" });
        break;
      case "amount":
        comparison = a.amount - b.amount;
        break;
    }
    return sort.direction === "asc" ? comparison : -comparison;
  });
}

/** Whether any filter is narrowing the list. */
export function hasActiveFilters(filters: ExpenseFilters): boolean {
  return (
    filters.query.trim() !== "" ||
    filters.category !== ALL_CATEGORIES ||
    filters.fromDate !== "" ||
    filters.toDate !== ""
  );
}

/** Computes the dashboard's headline figures. */
export function computeDashboardStats(expenses: Expense[]): DashboardStats {
  let totalAmount = 0;
  let highestAmount = 0;

  for (const expense of expenses) {
    totalAmount += expense.amount;
    if (expense.amount > highestAmount) highestAmount = expense.amount;
  }

  const transactionCount = expenses.length;
  return {
    totalAmount: roundCurrency(totalAmount),
    transactionCount,
    highestAmount: roundCurrency(highestAmount),
    averageAmount: transactionCount > 0 ? roundCurrency(totalAmount / transactionCount) : 0,
  };
}

/** Groups spending by category, sorted by total (highest first). */
export function computeCategoryBreakdown(expenses: Expense[]): CategoryBreakdownEntry[] {
  const totals = new Map<ExpenseCategory, { total: number; count: number }>();
  let grandTotal = 0;

  for (const expense of expenses) {
    const entry = totals.get(expense.category) ?? { total: 0, count: 0 };
    entry.total += expense.amount;
    entry.count += 1;
    totals.set(expense.category, entry);
    grandTotal += expense.amount;
  }

  return [...totals.entries()]
    .map(([category, { total, count }]) => ({
      category,
      total: roundCurrency(total),
      count,
      percentage: grandTotal > 0 ? Math.round((total / grandTotal) * 1000) / 10 : 0,
    }))
    .sort((a, b) => b.total - a.total || a.category.localeCompare(b.category));
}
