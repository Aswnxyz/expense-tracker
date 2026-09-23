const currencyFormatter = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

const dateFormatter = new Intl.DateTimeFormat("en-US", {
  month: "short",
  day: "numeric",
  year: "numeric",
});

/** Formats an amount as currency, e.g. "$1,240.50". */
export function formatCurrency(amount: number): string {
  return currencyFormatter.format(amount);
}

/** Rounds an amount to cents to counteract floating point drift. */
export function roundCurrency(amount: number): number {
  return Math.round(amount * 100) / 100;
}

/**
 * Parses a "YYYY-MM-DD" string as a *local* date.
 * Using the Date string constructor would parse as UTC and shift the day in
 * some timezones, so the parts are assembled explicitly.
 * Returns null when the string is not a real calendar date.
 */
export function parseLocalDate(date: string): Date | null {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return null;

  const year = Number(match[1]);
  const month = Number(match[2]);
  const day = Number(match[3]);
  const parsed = new Date(year, month - 1, day);

  const isValid =
    parsed.getFullYear() === year &&
    parsed.getMonth() === month - 1 &&
    parsed.getDate() === day;
  return isValid ? parsed : null;
}

/** Formats an ISO date for display, e.g. "Sep 23, 2026". */
export function formatDate(date: string): string {
  const parsed = parseLocalDate(date);
  return parsed ? dateFormatter.format(parsed) : date;
}

/** Today's date as a local "YYYY-MM-DD" string (used as the form default). */
export function todayISODate(): string {
  const now = new Date();
  const pad = (value: number) => String(value).padStart(2, "0");
  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`;
}
