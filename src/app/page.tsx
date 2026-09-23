import type { Metadata } from "next";
import { DashboardView } from "@/components/dashboard/DashboardView";

export const metadata: Metadata = {
  title: "Dashboard",
  description: "Overview of total spending, transaction counts, and category breakdown.",
};

export default function DashboardPage() {
  return <DashboardView />;
}
