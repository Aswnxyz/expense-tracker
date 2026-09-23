import type { ExpenseCategory } from "./types";

/** Presentation metadata for each category. Class strings are static so Tailwind can detect them. */
export interface CategoryMeta {
  /** Classes for the compact badge variant. */
  badgeClass: string;
  /** Classes for solid accents (chart bars, dots). */
  barClass: string;
}

export const CATEGORY_META: Record<ExpenseCategory, CategoryMeta> = {
  Food: {
    badgeClass: "bg-emerald-50 text-emerald-700 ring-emerald-600/20",
    barClass: "bg-emerald-500",
  },
  Transport: {
    badgeClass: "bg-sky-50 text-sky-700 ring-sky-600/20",
    barClass: "bg-sky-500",
  },
  Shopping: {
    badgeClass: "bg-violet-50 text-violet-700 ring-violet-600/20",
    barClass: "bg-violet-500",
  },
  Entertainment: {
    badgeClass: "bg-fuchsia-50 text-fuchsia-700 ring-fuchsia-600/20",
    barClass: "bg-fuchsia-500",
  },
  Bills: {
    badgeClass: "bg-amber-50 text-amber-700 ring-amber-600/20",
    barClass: "bg-amber-500",
  },
  Health: {
    badgeClass: "bg-rose-50 text-rose-700 ring-rose-600/20",
    barClass: "bg-rose-500",
  },
  Other: {
    badgeClass: "bg-slate-100 text-slate-700 ring-slate-600/20",
    barClass: "bg-slate-500",
  },
};
