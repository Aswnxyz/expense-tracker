"use client";

import {
  ArrowDownIcon,
  ArrowUpIcon,
  PencilIcon,
  TrashIcon,
} from "@/components/ui/Icons";
import { cn } from "@/lib/cn";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Expense, ExpenseSort, ExpenseSortKey, SortDirection } from "@/lib/types";
import { CategoryBadge } from "./CategoryBadge";

interface ExpenseTableProps {
  expenses: Expense[];
  sort: ExpenseSort;
  onSortChange(next: ExpenseSort): void;
  onEdit(expense: Expense): void;
  onDelete(expense: Expense): void;
}

interface SortableHeaderProps {
  label: string;
  sortKey: ExpenseSortKey;
  sort: ExpenseSort;
  onSortChange(next: ExpenseSort): void;
  className?: string;
}

function defaultDirectionFor(key: ExpenseSortKey): SortDirection {
  return key === "title" ? "asc" : "desc";
}

function SortableHeader({ label, sortKey, sort, onSortChange, className }: SortableHeaderProps) {
  const isActive = sort.key === sortKey;
  const nextDirection: SortDirection = isActive
    ? sort.direction === "asc"
      ? "desc"
      : "asc"
    : defaultDirectionFor(sortKey);

  return (
    <th scope="col" className={cn("px-4 py-3 text-xs font-semibold tracking-wide text-zinc-500", className)}>
      <button
        type="button"
        onClick={() => onSortChange({ key: sortKey, direction: nextDirection })}
        aria-label={`Sort by ${label} (${isActive ? `currently ${sort.direction === "asc" ? "ascending" : "descending"}` : "not sorted"})`}
        className={cn(
          "inline-flex items-center gap-1 rounded transition-colors hover:text-zinc-900",
          isActive && "text-indigo-600 hover:text-indigo-700",
        )}
      >
        {label}
        {isActive ? (
          sort.direction === "asc" ? (
            <ArrowUpIcon className="size-3.5" />
          ) : (
            <ArrowDownIcon className="size-3.5" />
          )
        ) : null}
      </button>
    </th>
  );
}

interface RowActionsProps {
  expense: Expense;
  onEdit(expense: Expense): void;
  onDelete(expense: Expense): void;
}

function RowActions({ expense, onEdit, onDelete }: RowActionsProps) {
  return (
    <div className="flex items-center justify-end gap-1">
      <button
        type="button"
        onClick={() => onEdit(expense)}
        aria-label={`Edit ${expense.title}`}
        className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
      >
        <PencilIcon className="size-4" />
      </button>
      <button
        type="button"
        onClick={() => onDelete(expense)}
        aria-label={`Delete ${expense.title}`}
        className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
      >
        <TrashIcon className="size-4" />
      </button>
    </div>
  );
}

/** Desktop expense table with sortable columns. Hidden below the md breakpoint. */
export function ExpenseTable({ expenses, sort, onSortChange, onEdit, onDelete }: ExpenseTableProps) {
  return (
    <div className="hidden overflow-x-auto md:block">
      <table className="w-full text-left text-sm">
        <thead className="border-b border-zinc-200 bg-zinc-50/70">
          <tr>
            <SortableHeader label="Date" sortKey="date" sort={sort} onSortChange={onSortChange} className="w-36" />
            <SortableHeader label="Title" sortKey="title" sort={sort} onSortChange={onSortChange} />
            <th scope="col" className="px-4 py-3 text-xs font-semibold tracking-wide text-zinc-500">
              Category
            </th>
            <SortableHeader
              label="Amount"
              sortKey="amount"
              sort={sort}
              onSortChange={onSortChange}
              className="w-36 text-right"
            />
            <th
              scope="col"
              className="w-28 px-4 py-3 text-right text-xs font-semibold tracking-wide text-zinc-500"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-100">
          {expenses.map((expense) => (
            <tr key={expense.id} className="transition-colors hover:bg-zinc-50/70">
              <td className="px-4 py-3 whitespace-nowrap text-zinc-600">
                <time dateTime={expense.date}>{formatDate(expense.date)}</time>
              </td>
              <td className="max-w-80 px-4 py-3">
                <p className="truncate font-medium text-zinc-900">{expense.title}</p>
                {expense.description ? (
                  <p className="mt-0.5 truncate text-xs text-zinc-500">{expense.description}</p>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <CategoryBadge category={expense.category} />
              </td>
              <td className="px-4 py-3 text-right font-semibold whitespace-nowrap tabular-nums text-zinc-900">
                {formatCurrency(expense.amount)}
              </td>
              <td className="px-4 py-3">
                <RowActions expense={expense} onEdit={onEdit} onDelete={onDelete} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/** Mobile card list equivalent of ExpenseTable. Shown below the md breakpoint. */
export function ExpenseCards({
  expenses,
  onEdit,
  onDelete,
}: Pick<ExpenseTableProps, "expenses" | "onEdit" | "onDelete">) {
  return (
    <ul className="space-y-3 md:hidden">
      {expenses.map((expense) => (
        <li key={expense.id} className="rounded-xl border border-zinc-200/80 bg-white p-4">
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium text-zinc-900">{expense.title}</p>
              <div className="mt-1.5 flex flex-wrap items-center gap-2">
                <CategoryBadge category={expense.category} />
                <time dateTime={expense.date} className="text-xs text-zinc-500">
                  {formatDate(expense.date)}
                </time>
              </div>
            </div>
            <p className="font-semibold whitespace-nowrap tabular-nums text-zinc-900">
              {formatCurrency(expense.amount)}
            </p>
          </div>
          {expense.description ? (
            <p className="mt-2 line-clamp-2 text-sm text-zinc-500">{expense.description}</p>
          ) : null}
          <div className="mt-3 flex justify-end gap-1 border-t border-zinc-100 pt-2">
            <button
              type="button"
              onClick={() => onEdit(expense)}
              aria-label={`Edit ${expense.title}`}
              className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-indigo-50 hover:text-indigo-600"
            >
              <PencilIcon className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => onDelete(expense)}
              aria-label={`Delete ${expense.title}`}
              className="rounded-md p-1.5 text-zinc-400 transition-colors hover:bg-rose-50 hover:text-rose-600"
            >
              <TrashIcon className="size-4" />
            </button>
          </div>
        </li>
      ))}
    </ul>
  );
}
