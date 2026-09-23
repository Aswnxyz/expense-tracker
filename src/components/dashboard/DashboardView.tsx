"use client";

import { useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Card } from "@/components/ui/Card";
import { DataLoadError } from "@/components/DataLoadError";
import { EmptyState } from "@/components/ui/EmptyState";
import {
  ArrowUpRightIcon,
  InboxIcon,
  PercentIcon,
  PlusIcon,
  ReceiptIcon,
  WalletIcon,
} from "@/components/ui/Icons";
import { Skeleton } from "@/components/ui/Skeleton";
import { formatCurrency } from "@/lib/format";
import { computeCategoryBreakdown, computeDashboardStats, sortExpenses } from "@/lib/stats";
import { useExpenses } from "@/providers/expense-provider";
import { CategoryBreakdown } from "./CategoryBreakdown";
import { RecentExpenses } from "./RecentExpenses";
import { StatCard } from "./StatCard";
import { ExpenseFormModal } from "@/components/expenses/ExpenseFormModal";

const RECENT_LIMIT = 5;

function DashboardSkeleton() {
  return (
    <div role="status" aria-label="Loading dashboard" className="space-y-6">
      <div>
        <Skeleton className="h-8 w-48" />
        <Skeleton className="mt-2 h-4 w-72" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Skeleton key={index} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-80 lg:col-span-3" />
        <Skeleton className="h-80 lg:col-span-2" />
      </div>
      <span className="sr-only">Loading dashboard</span>
    </div>
  );
}

/** Dashboard landing page: headline stats, category breakdown, and recent activity. */
export function DashboardView() {
  const { expenses, status } = useExpenses();
  const [isFormOpen, setIsFormOpen] = useState(false);

  const stats = useMemo(() => computeDashboardStats(expenses), [expenses]);
  const breakdown = useMemo(() => computeCategoryBreakdown(expenses), [expenses]);
  const recentExpenses = useMemo(
    () =>
      sortExpenses(expenses, { key: "date", direction: "desc" }).slice(0, RECENT_LIMIT),
    [expenses],
  );

  const openAddForm = () => setIsFormOpen(true);

  const pageHeader = (
    <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-zinc-900">Dashboard</h1>
        <p className="mt-1 text-sm text-zinc-500">A quick look at your spending.</p>
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
          <DashboardSkeleton />
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

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          label="Total expenses"
          value={formatCurrency(stats.totalAmount)}
          icon={<WalletIcon className="size-5" />}
        />
        <StatCard
          label="Transactions"
          value={String(stats.transactionCount)}
          icon={<ReceiptIcon className="size-5" />}
        />
        <StatCard
          label="Highest expense"
          value={formatCurrency(stats.highestAmount)}
          icon={<ArrowUpRightIcon className="size-5" />}
        />
        <StatCard
          label="Average expense"
          value={formatCurrency(stats.averageAmount)}
          icon={<PercentIcon className="size-5" />}
        />
      </div>

      {!hasExpenses ? (
        <Card>
          <EmptyState
            icon={<InboxIcon className="size-5" />}
            title="Welcome to your expense tracker"
            description="Add your first expense to see totals, averages, and a category breakdown here."
            action={
              <Button onClick={openAddForm}>
                <PlusIcon className="size-4" />
                Add your first expense
              </Button>
            }
          />
        </Card>
      ) : (
        <div className="grid gap-4 lg:grid-cols-5">
          <div className="lg:col-span-3">
            <CategoryBreakdown entries={breakdown} />
          </div>
          <div className="lg:col-span-2">
            <RecentExpenses expenses={recentExpenses} />
          </div>
        </div>
      )}

      <ExpenseFormModal open={isFormOpen} onClose={() => setIsFormOpen(false)} />
    </div>
  );
}
