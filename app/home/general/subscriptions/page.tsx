"use client";

import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { useAuthStore } from "@/stores/auth.store";
import { Check } from "lucide-react";

const plans = [
  {
    id: "free",
    name: "Free",
    price: "$0",
    points: ["Daily journal", "Manual accounts", "Basic analytics"],
  },
  {
    id: "pro",
    name: "Pro",
    price: "$19",
    points: ["Juvo AI chat", "Behavioural insights", "CSV / JSON export"],
  },
  {
    id: "super",
    name: "Super",
    price: "$39",
    points: ["Unlimited reviews", "Broker sync when it ships", "Priority coaching context"],
  },
];

export default function SubscriptionsPage() {
  const plan = useAuthStore((state) => state.user?.subscription?.plan || "free");

  return (
    <DashboardShell>
      <div className="space-y-6">
        <PageHeader
          eyebrow="General"
          title="Subscriptions"
          description="Start free. Upgrade when Juvo AI and deeper reviews become part of the daily ritual."
        />
        <div className="grid gap-4 lg:grid-cols-3">
          {plans.map((item) => {
            const current = item.id === plan;
            return (
              <Card
                key={item.id}
                className={`p-6 ${current ? "ring-2 ring-primary" : ""}`}
              >
                <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                  {item.name}
                </p>
                <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">
                  {item.price}
                  <span className="text-sm font-medium text-slate-400"> / mo</span>
                </p>
                <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">
                  {item.points.map((point) => (
                    <li key={point} className="flex items-center gap-2">
                      <Check size={16} className="text-primary" />
                      {point}
                    </li>
                  ))}
                </ul>
                <Button className="mt-6 w-full" variant={current ? "primary" : "ghost"} disabled>
                  {current ? "Current plan" : "Billing coming next"}
                </Button>
              </Card>
            );
          })}
        </div>
      </div>
    </DashboardShell>
  );
}
