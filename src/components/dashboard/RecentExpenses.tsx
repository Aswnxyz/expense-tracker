import Link from "next/link";
import { Card, CardHeader } from "@/components/ui/Card";
import { ChevronRightIcon } from "@/components/ui/Icons";
import { CategoryBadge } from "@/components/expenses/CategoryBadge";
import { formatCurrency, formatDate } from "@/lib/format";
import type { Expense } from "@/lib/types";

interface RecentExpensesProps {
  expenses: Expense[];
}

/** Compact list of the five most recent transactions. */
export function RecentExpenses({ expenses }: RecentExpensesProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Recent expenses"
        description="Your five most recent transactions"
        action={
          <Link
            href="/expenses"
            className="inline-flex items-center gap-1 text-xs font-medium text-indigo-600 transition-colors hover:text-indigo-500"
          >
            View all
            <ChevronRightIcon className="size-3.5" />
          </Link>
        }
      />
      <ul className="flex-1 divide-y divide-zinc-100">
        {expenses.map((expense) => (
          <li key={expense.id} className="flex items-center justify-between gap-3 px-5 py-3.5">
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-zinc-900">{expense.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2">
                <CategoryBadge category={expense.category} />
                <time dateTime={expense.date} className="text-xs text-zinc-500">
                  {formatDate(expense.date)}
                </time>
              </div>
            </div>
            <p className="text-sm font-semibold whitespace-nowrap tabular-nums text-zinc-900">
              {formatCurrency(expense.amount)}
            </p>
          </li>
        ))}
      </ul>
    </Card>
  );
}
