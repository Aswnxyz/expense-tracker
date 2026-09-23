import type { Metadata } from "next";
import { ExpensesView } from "@/components/expenses/ExpensesView";

export const metadata: Metadata = {
  title: "Expenses",
  description: "Search, filter, sort, and manage your expenses.",
};

export default function ExpensesPage() {
  return <ExpensesView />;
}
