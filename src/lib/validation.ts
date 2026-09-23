import { parseLocalDate, roundCurrency, todayISODate } from "./format";
import { EXPENSE_CATEGORIES, type Expense, type ExpenseCategory, type ExpenseInput } from "./types";

const MAX_TITLE_LENGTH = 100;
const MAX_DESCRIPTION_LENGTH = 500;

/** Raw form state; amounts and category stay strings until validated. */
export interface ExpenseFormValues {
  title: string;
  amount: string;
  category: ExpenseCategory | "";
  date: string;
  description: string;
}

export type ExpenseFormErrors = Partial<Record<keyof ExpenseFormValues, string>>;

/** Runtime guard for values arriving from storage or form input. */
export function isExpenseCategory(value: unknown): value is ExpenseCategory {
  return (
    typeof value === "string" &&
    (EXPENSE_CATEGORIES as readonly string[]).includes(value)
  );
}

/** Validates the form and returns a message per invalid field. */
export function validateExpenseForm(values: ExpenseFormValues): ExpenseFormErrors {
  const errors: ExpenseFormErrors = {};

  const title = values.title.trim();
  if (!title) {
    errors.title = "Title is required.";
  } else if (title.length > MAX_TITLE_LENGTH) {
    errors.title = `Title must be ${MAX_TITLE_LENGTH} characters or fewer.`;
  }

  const amountRaw = values.amount.trim().replace(/,/g, "");
  if (!amountRaw) {
    errors.amount = "Amount is required.";
  } else if (!Number.isFinite(Number(amountRaw))) {
    errors.amount = "Enter a valid amount.";
  } else if (Number(amountRaw) <= 0) {
    errors.amount = "Amount must be greater than zero.";
  }

  if (!values.category) {
    errors.category = "Category is required.";
  } else if (!isExpenseCategory(values.category)) {
    errors.category = "Choose a valid category.";
  }

  if (!values.date) {
    errors.date = "Date is required.";
  } else if (!parseLocalDate(values.date)) {
    errors.date = "Enter a valid date.";
  }

  const description = values.description.trim();
  if (description.length > MAX_DESCRIPTION_LENGTH) {
    errors.description = `Description must be ${MAX_DESCRIPTION_LENGTH} characters or fewer.`;
  }

  return errors;
}

/**
 * Converts validated form values into repository input.
 * Throws when called before validation, since the category type cannot be
 * narrowed without the runtime guard.
 */
export function expenseFormValuesToInput(values: ExpenseFormValues): ExpenseInput {
  if (!isExpenseCategory(values.category)) {
    throw new Error("Cannot build an expense without a valid category.");
  }

  const description = values.description.trim();
  return {
    title: values.title.trim(),
    amount: roundCurrency(Number(values.amount.trim().replace(/,/g, ""))),
    category: values.category,
    date: values.date,
    ...(description ? { description } : {}),
  };
}

/** Maps an existing expense (or a blank new one) to form values. */
export function expenseToFormValues(expense?: Expense | null): ExpenseFormValues {
  if (!expense) {
    return { title: "", amount: "", category: "", date: todayISODate(), description: "" };
  }
  return {
    title: expense.title,
    amount: String(expense.amount),
    category: expense.category,
    date: expense.date,
    description: expense.description ?? "",
  };
}
