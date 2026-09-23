import type { InputHTMLAttributes, ReactNode, SelectHTMLAttributes, TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

/**
 * Shared styling for text inputs, selects, and textareas.
 * Focus uses a soft indigo ring; invalid fields switch to rose automatically
 * via the `aria-invalid` attribute.
 */
const controlClasses = cn(
  "block w-full rounded-lg border border-zinc-300 bg-white px-3 py-2 text-sm text-zinc-900",
  "placeholder:text-zinc-400",
  "focus:border-indigo-500 focus:outline-none focus:ring-4 focus:ring-indigo-500/10",
  "aria-invalid:border-rose-500 aria-invalid:focus:border-rose-500 aria-invalid:focus:ring-rose-500/10",
  "disabled:cursor-not-allowed disabled:bg-zinc-50 disabled:text-zinc-500",
);

export function TextInput({ className, ...rest }: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(controlClasses, className)} {...rest} />;
}

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  children: ReactNode;
}

export function SelectInput({ className, children, ...rest }: SelectInputProps) {
  return (
    <select className={cn(controlClasses, className)} {...rest}>
      {children}
    </select>
  );
}

export function TextArea({ className, ...rest }: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return <textarea className={cn(controlClasses, "resize-y", className)} {...rest} />;
}
