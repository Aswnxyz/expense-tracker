"use client";

import { SearchIcon } from "@/components/ui/Icons";
import { SelectInput, TextInput } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { hasActiveFilters } from "@/lib/stats";
import { ALL_CATEGORIES, EXPENSE_CATEGORIES, type ExpenseFilters, type ExpenseSort } from "@/lib/types";

interface ExpenseFiltersProps {
  filters: ExpenseFilters;
  onFiltersChange(next: ExpenseFilters): void;
  sort: ExpenseSort;
  onSortChange(next: ExpenseSort): void;
  /** Number of expenses currently visible after filtering. */
  resultCount: number;
  /** Total number of stored expenses. */
  totalCount: number;
}

const SORT_OPTIONS: Array<{ value: string; label: string; sort: ExpenseSort }> = [
  { value: "date:desc", label: "Newest first", sort: { key: "date", direction: "desc" } },
  { value: "date:asc", label: "Oldest first", sort: { key: "date", direction: "asc" } },
  { value: "amount:desc", label: "Amount: high to low", sort: { key: "amount", direction: "desc" } },
  { value: "amount:asc", label: "Amount: low to high", sort: { key: "amount", direction: "asc" } },
  { value: "title:asc", label: "Title: A to Z", sort: { key: "title", direction: "asc" } },
  { value: "title:desc", label: "Title: Z to A", sort: { key: "title", direction: "desc" } },
];

const labelClasses = "mb-1.5 block text-xs font-medium text-zinc-600";

/** Search, category, date-range, and (mobile) sort controls with a summary footer. */
export function ExpenseFilters({
  filters,
  onFiltersChange,
  sort,
  onSortChange,
  resultCount,
  totalCount,
}: ExpenseFiltersProps) {
  const hasActive = hasActiveFilters(filters);
  const dateRangeInvalid =
    filters.fromDate !== "" && filters.toDate !== "" && filters.fromDate > filters.toDate;

  const update = (patch: Partial<ExpenseFilters>) => onFiltersChange({ ...filters, ...patch });

  return (
    <div className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div>
          <label htmlFor="expense-search" className={labelClasses}>
            Search
          </label>
          <div className="relative">
            <SearchIcon className="pointer-events-none absolute top-1/2 left-3 size-4 -translate-y-1/2 text-zinc-400" />
            <TextInput
              id="expense-search"
              type="search"
              className="pl-9"
              placeholder="Title or description"
              value={filters.query}
              onChange={(event) => update({ query: event.target.value })}
            />
          </div>
        </div>

        <div>
          <label htmlFor="expense-category-filter" className={labelClasses}>
            Category
          </label>
          <SelectInput
            id="expense-category-filter"
            value={filters.category}
            onChange={(event) =>
              update({ category: event.target.value as ExpenseFilters["category"] })
            }
          >
            <option value={ALL_CATEGORIES}>All categories</option>
            {EXPENSE_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </SelectInput>
        </div>

        <div>
          <label htmlFor="expense-date-from" className={labelClasses}>
            From date
          </label>
          <TextInput
            id="expense-date-from"
            type="date"
            value={filters.fromDate}
            max={filters.toDate || undefined}
            onChange={(event) => update({ fromDate: event.target.value })}
          />
        </div>

        <div>
          <label htmlFor="expense-date-to" className={labelClasses}>
            To date
          </label>
          <TextInput
            id="expense-date-to"
            type="date"
            value={filters.toDate}
            min={filters.fromDate || undefined}
            onChange={(event) => update({ toDate: event.target.value })}
          />
        </div>
      </div>

      {dateRangeInvalid ? (
        <p className="text-xs font-medium text-amber-700" role="status">
          The start date is after the end date, so no expenses match this range.
        </p>
      ) : null}

      <div className="flex flex-col gap-3 border-t border-zinc-100 pt-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-3">
          <p className="text-xs text-zinc-500">
            Showing{" "}
            <span className="font-semibold text-zinc-700">{resultCount}</span> of{" "}
            {totalCount} {totalCount === 1 ? "expense" : "expenses"}
          </p>
          {hasActive ? (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                onFiltersChange({
                  query: "",
                  category: ALL_CATEGORIES,
                  fromDate: "",
                  toDate: "",
                })
              }
            >
              Clear filters
            </Button>
          ) : null}
        </div>

        {/* Desktop sorting happens via the table headers; this select serves small screens. */}
        <div className="sm:max-w-xs md:hidden">
          <label htmlFor="expense-sort" className="sr-only">
            Sort expenses
          </label>
          <SelectInput
            id="expense-sort"
            value={`${sort.key}:${sort.direction}`}
            onChange={(event) => {
              const option = SORT_OPTIONS.find((item) => item.value === event.target.value);
              if (option) onSortChange(option.sort);
            }}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </SelectInput>
        </div>
      </div>
    </div>
  );
}
