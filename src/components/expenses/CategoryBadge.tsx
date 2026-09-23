import { Badge } from "@/components/ui/Badge";
import { CATEGORY_META } from "@/lib/categories";
import { cn } from "@/lib/cn";
import type { ExpenseCategory } from "@/lib/types";

interface CategoryBadgeProps {
  category: ExpenseCategory;
  className?: string;
}

/** Category pill colored according to the shared category palette. */
export function CategoryBadge({ category, className }: CategoryBadgeProps) {
  return (
    <Badge className={cn(CATEGORY_META[category].badgeClass, className)}>
      <span aria-hidden="true" className="size-1.5 rounded-full bg-current opacity-70" />
      {category}
    </Badge>
  );
}
