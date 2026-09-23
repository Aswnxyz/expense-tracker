import { isExpenseCategory } from "../validation";
import type { Expense, ExpenseInput } from "../types";
import type { ExpenseRepository } from "./types";

const STORAGE_KEY = "expense-tracker:v1:expenses";

/**
 * Small artificial latency so the async contract of the repository behaves
 * like a network-backed store and loading/pending states are real.
 */
const SIMULATED_LATENCY_MS = 150;

const CORRUPT_DATA_MESSAGE =
  "The expenses saved in this browser could not be read. Clear the saved data to start fresh.";

const STORAGE_UNAVAILABLE_MESSAGE =
  "This browser did not allow access to local storage, so expenses cannot be saved.";

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function getStorage(): Storage {
  if (typeof window === "undefined") {
    throw new Error(STORAGE_UNAVAILABLE_MESSAGE);
  }
  try {
    return window.localStorage;
  } catch {
    throw new Error(STORAGE_UNAVAILABLE_MESSAGE);
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null;
}

function createId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `exp_${Date.now().toString(36)}_${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Coerces a parsed JSON value into an Expense.
 * Unknown categories fall back to "Other" and malformed records are rejected,
 * so a single bad entry cannot crash the app.
 */
function normalizeExpense(raw: unknown): Expense | null {
  if (!isRecord(raw)) return null;
  const { id, title, amount, category, date, description, createdAt, updatedAt } = raw;

  if (typeof id !== "string" || id === "") return null;
  if (typeof title !== "string") return null;
  if (typeof amount !== "number" || !Number.isFinite(amount)) return null;
  if (typeof date !== "string") return null;

  const timestamp = typeof createdAt === "string" ? createdAt : "";
  return {
    id,
    title,
    amount,
    category: isExpenseCategory(category) ? category : "Other",
    date,
    ...(typeof description === "string" && description !== ""
      ? { description }
      : {}),
    createdAt: timestamp,
    updatedAt: typeof updatedAt === "string" ? updatedAt : timestamp,
  };
}

/** ExpenseRepository backed by the browser's localStorage. */
export class LocalStorageExpenseRepository implements ExpenseRepository {
  async getAll(): Promise<Expense[]> {
    await delay(SIMULATED_LATENCY_MS);
    return this.read();
  }

  async create(input: ExpenseInput): Promise<Expense> {
    await delay(SIMULATED_LATENCY_MS);
    const expenses = this.read();
    const now = new Date().toISOString();
    const expense: Expense = { id: createId(), ...input, createdAt: now, updatedAt: now };
    this.write([...expenses, expense]);
    return expense;
  }

  async update(id: string, input: ExpenseInput): Promise<Expense> {
    await delay(SIMULATED_LATENCY_MS);
    const expenses = this.read();
    const existing = expenses.find((expense) => expense.id === id);
    if (!existing) {
      throw new Error("This expense no longer exists. It may have been deleted already.");
    }

    const updated: Expense = {
      ...existing,
      ...input,
      id: existing.id,
      createdAt: existing.createdAt,
      updatedAt: new Date().toISOString(),
    };
    this.write(expenses.map((expense) => (expense.id === id ? updated : expense)));
    return updated;
  }

  async remove(id: string): Promise<void> {
    await delay(SIMULATED_LATENCY_MS);
    const expenses = this.read();
    if (!expenses.some((expense) => expense.id === id)) {
      throw new Error("This expense no longer exists. It may have been deleted already.");
    }
    this.write(expenses.filter((expense) => expense.id !== id));
  }

  async clear(): Promise<void> {
    await delay(SIMULATED_LATENCY_MS);
    getStorage().removeItem(STORAGE_KEY);
  }

  private read(): Expense[] {
    let raw: string | null;
    try {
      raw = getStorage().getItem(STORAGE_KEY);
    } catch {
      throw new Error(STORAGE_UNAVAILABLE_MESSAGE);
    }
    if (raw === null) return [];

    let parsed: unknown;
    try {
      parsed = JSON.parse(raw);
    } catch {
      throw new Error(CORRUPT_DATA_MESSAGE);
    }
    if (!Array.isArray(parsed)) {
      throw new Error(CORRUPT_DATA_MESSAGE);
    }

    return parsed
      .map(normalizeExpense)
      .filter((expense): expense is Expense => expense !== null);
  }

  private write(expenses: Expense[]): void {
    try {
      getStorage().setItem(STORAGE_KEY, JSON.stringify(expenses));
    } catch {
      throw new Error(
        "This browser could not save the expense. Local storage may be full or disabled.",
      );
    }
  }
}
