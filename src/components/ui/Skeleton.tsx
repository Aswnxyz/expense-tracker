import { cn } from "@/lib/cn";

/** Shimmering placeholder used while data loads. Decorative by design. */
export function Skeleton({ className }: { className?: string }) {
  return <div aria-hidden="true" className={cn("animate-pulse rounded-md bg-zinc-200/70", className)} />;
}
