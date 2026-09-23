"use client";

import { Card, CardBody, CardHeader } from "@/components/ui/Card";
import { EmptyState } from "@/components/ui/EmptyState";
import { PieChartIcon } from "@/components/dashboard/icons/PieChartIcon";
import { CATEGORY_META } from "@/lib/categories";
import { cn } from "@/lib/cn";
import { formatCurrency } from "@/lib/format";
import type { CategoryBreakdownEntry } from "@/lib/types";

interface CategoryBreakdownProps {
  entries: CategoryBreakdownEntry[];
}

/** Horizontal bar chart of spending share per category. */
export function CategoryBreakdown({ entries }: CategoryBreakdownProps) {
  return (
    <Card className="flex h-full flex-col">
      <CardHeader
        title="Spending by category"
        description="Where your money went, highest share first"
      />
      {entries.length === 0 ? (
        <EmptyState
          icon={<PieChartIcon className="size-5" />}
          title="No spending yet"
          description="Category totals appear once you add expenses."
        />
      ) : (
        <CardBody className="flex-1 space-y-5">
          {entries.map((entry) => {
            const meta = CATEGORY_META[entry.category];
            return (
              <div key={entry.category}>
                <div className="flex items-baseline justify-between gap-3">
                  <span className="flex min-w-0 items-center gap-2 text-sm font-medium text-zinc-700">
                    <span
                      aria-hidden="true"
                      className={cn("size-2.5 shrink-0 rounded-full", meta.barClass)}
                    />
                    <span className="truncate">{entry.category}</span>
                  </span>
                  <span className="text-sm font-semibold whitespace-nowrap tabular-nums text-zinc-900">
                    {formatCurrency(entry.total)}
                    <span className="ml-1.5 text-xs font-normal text-zinc-500">
                      {entry.percentage}%
                    </span>
                  </span>
                </div>
                <div
                  role="presentation"
                  aria-hidden="true"
                  className="mt-1.5 h-2 overflow-hidden rounded-full bg-zinc-100"
                >
                  <div
                    className={cn("h-full rounded-full", meta.barClass)}
                    style={{ width: `${entry.percentage}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-zinc-500">
                  {entry.count} {entry.count === 1 ? "transaction" : "transactions"}
                </p>
              </div>
            );
          })}
        </CardBody>
      )}
    </Card>
  );
}
