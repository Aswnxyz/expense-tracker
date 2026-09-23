"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { ConfirmDialog } from "@/components/ui/ConfirmDialog";
import { DataLoadError } from "@/components/DataLoadError";
import { EmptyState } from "@/components/ui/EmptyState";
import { InboxIcon, PlusIcon } from "@/components/ui/Icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency, formatDate } from "@/lib/format";
import {
  DEFAULT_EXPENSE_FILTERS,
  DEFAULT_EXPENSE_SORT,
  type Expense,
  type ExpenseFilters,
  type ExpenseSort,
} from "@/lib/types";
import { filterExpenses, sortExpenses } from "@/lib/stats";
import { useExpenses } from "@/providers/expense-provider";
import { ExpenseFilters as ExpenseFilterControls } from "./ExpenseFilters";
import { ExpenseFormModal } from "./ExpenseFormModal";
import { ExpenseCards, ExpenseTable } from "./ExpenseTable";

function ExpensesSkeleton() {
  return (
    <div role="status" aria-label="Loading expenses" className="space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <Skeleton className="h-8 w-40" />
          <Skeleton className="mt-2 h-4 w-64" />
        </div>
        <Skeleton className="h-10 w-36" />
      </div>
      <Card className="space-y-5 p-5">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Skeleton key={index} className="h-16" />
          ))}
        </div>
        <div className="space-y-3 border-t border-zinc-100 pt-4">
          {Array.from({ length: 5 }).map((_, index) => (
            <Skeleton key={index} className="h-14" />
          ))}
        </div>
      </Card>
      <span className="sr-only">Loading expenses</span>
    </div>
  );
}

/** Full expense management experience: list, filters, sorting, and CRUD dialogs. */
export function ExpensesView() {
  const { expenses, status, isMutating, deleteExpense } = useExpenses();

  const [filters, setFilters] = useState<ExpenseFilters>(DEFAULT_EXPENSE_FILTERS);
  const [sort, setSort] = useState<ExpenseSort>(DEFAULT_EXPENSE_SORT);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [pendingDelete, setPendingDelete] = useState<Expense | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const visibleExpenses = useMemo(
    () => sortExpenses(filterExpenses(expenses, filters), sort),
    [expenses, filters, sort],
  );

  const openAddForm = () => {
    setEditingExpense(null);
    setIsFormOpen(true);
  };

  const openEditForm = (expense: Expense) => {
    setEditingExpense(expense);
    setIsFormOpen(true);
  };

  const requestDelete = (expense: Expense) => {
    setDeleteError(null);
    setPendingDelete(expense);
  };

  const confirmDelete = async () => {
    if (!pendingDelete) return;
    setDeleteError(null);
    try {
      await deleteExpense(pendingDelete.id);
      setPendingDelete(null);
    } catch (error) {
      setDeleteError(
        error instanceof Error ? error.message : "The expense could not be deleted.",
      );
    }
  };

  const pageHeader = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Expenses</h1>
        <p className="mt-1 text-sm text-zinc-500">
          Search, filter, and manage every transaction.
        </p>
      </div>
      <Button onClick={openAddForm} className="self-start sm:self-auto">
        <PlusIcon className="size-4" />
        Add expense
      </Button>
    </div>
  );

  if (status === "loading") {
    return (
      <>
        {pageHeader}
        <div className="mt-6">
          <ExpensesSkeleton />
        </div>
      </>
    );
  }

  if (status === "error") {
    return (
      <div className="space-y-6">
        {pageHeader}
        <DataLoadError />
      </div>
    );
  }

  const hasExpenses = expenses.length > 0;

  return (
    <div className="space-y-6">
      {pageHeader}

      <Card>
        <div className="border-b border-zinc-100 p-5">
          <ExpenseFilterControls
            filters={filters}
            onFiltersChange={setFilters}
            sort={sort}
            onSortChange={setSort}
            resultCount={visibleExpenses.length}
            totalCount={expenses.length}
          />
        </div>

        {!hasExpenses ? (
          <EmptyState
            icon={<InboxIcon className="size-5" />}
            title="No expenses yet"
            description="Add your first expense to start tracking where your money goes."
            action={
              <Button onClick={openAddForm}>
                <PlusIcon className="size-4" />
                Add your first expense
              </Button>
            }
          />
        ) : visibleExpenses.length === 0 ? (
          <EmptyState
            icon={<InboxIcon className="size-5" />}
            title="No matching expenses"
            description="Try adjusting the search, category, or date filters."
            action={
              <Button
                variant="secondary"
                onClick={() => setFilters(DEFAULT_EXPENSE_FILTERS)}
              >
                Clear filters
              </Button>
            }
          />
        ) : (
          <>
            <ExpenseTable
              expenses={visibleExpenses}
              sort={sort}
              onSortChange={setSort}
              onEdit={openEditForm}
              onDelete={requestDelete}
            />
            <div className="p-4 md:hidden">
              <ExpenseCards
                expenses={visibleExpenses}
                onEdit={openEditForm}
                onDelete={requestDelete}
              />
            </div>
          </>
        )}
      </Card>

      <ExpenseFormModal
        open={isFormOpen}
        expense={editingExpense}
        onClose={() => setIsFormOpen(false)}
      />

      <ConfirmDialog
        open={pendingDelete !== null}
        title="Delete expense"
        confirmLabel="Delete"
        busy={isMutating}
        error={deleteError}
        onConfirm={() => void confirmDelete()}
        onCancel={() => {
          setPendingDelete(null);
          setDeleteError(null);
        }}
        message={
          pendingDelete ? (
            <>
              <p>
                Delete <span className="font-medium text-zinc-900">{pendingDelete.title}</span>{" "}
                ({formatCurrency(pendingDelete.amount)}) on {formatDate(pendingDelete.date)}?
              </p>
              <p className="text-xs text-zinc-500">This action cannot be undone.</p>
            </>
          ) : null
        }
      />
    </div>
  );
}
