"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/cn";
import { DashboardIcon, ListIcon, WalletIcon, XIcon } from "@/components/ui/Icons";

const NAV_ITEMS = [
  { href: "/", label: "Dashboard", icon: DashboardIcon },
  { href: "/expenses", label: "Expenses", icon: ListIcon },
] as const;

interface SidebarProps {
  /** Hides the drawer close button when rendered as the desktop sidebar. */
  onClose?(): void;
  /** Called after a link is clicked (used to close the mobile drawer). */
  onNavigate?(): void;
  className?: string;
}

export function Sidebar({ onClose, onNavigate, className }: SidebarProps) {
  const pathname = usePathname();

  return (
    <div className={cn("flex h-full flex-col bg-white", className)}>
      <div className="flex h-16 items-center justify-between gap-2 border-b border-zinc-200/80 px-5">
        <Link
          href="/"
          onClick={onNavigate}
          className="flex min-w-0 items-center gap-2.5"
        >
          <span className="flex size-8 shrink-0 items-center justify-center rounded-lg bg-indigo-600 text-white">
            <WalletIcon className="size-4" />
          </span>
          <span className="truncate text-sm font-semibold tracking-tight text-zinc-900">
            Expense Tracker
          </span>
        </Link>
        {onClose ? (
          <button
            type="button"
            onClick={onClose}
            aria-label="Close navigation menu"
            className="rounded-md p-1.5 text-zinc-400 hover:bg-zinc-100 hover:text-zinc-600"
          >
            <XIcon className="size-5" />
          </button>
        ) : null}
      </div>

      <nav aria-label="Main navigation" className="flex-1 space-y-1 p-3">
        {NAV_ITEMS.map(({ href, label, icon: ItemIcon }) => {
          const isActive = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              onClick={onNavigate}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors",
                isActive
                  ? "bg-indigo-50 text-indigo-700"
                  : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900",
              )}
            >
              <ItemIcon className="size-4 shrink-0" />
              {label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-zinc-200/80 px-5 py-4 text-xs text-zinc-500">
        Expenses are saved locally in this browser.
      </div>
    </div>
  );
}
