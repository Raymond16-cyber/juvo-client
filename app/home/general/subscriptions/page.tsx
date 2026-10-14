"use client";

import { useCallback, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Check, CreditCard, ExternalLink, LoaderCircle, RefreshCw, ShieldCheck } from "lucide-react";
import DashboardShell from "@/components/dashboard/DashboardShell";
import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import PageHeader from "@/components/ui/PageHeader";
import { getApiErrorMessage } from "@/lib/axios";
import { formatDate, formatMoney } from "@/lib/format";
import { useAuthStore } from "@/stores/auth.store";
import { cancelBillingSubscriptionService, getBillingManagementLinkService, getBillingOverviewService, initializeBillingCheckoutService, reconcileBillingService, verifyBillingPaymentService } from "@/services/billing.service";
import type { BillingOverview, BillingPlan, BillingSubscription } from "@/types/billing.types";

const planDetails: Record<BillingPlan, { name: string; points: string[] }> = {
  free: { name: "Free", points: ["Daily journal", "Manual accounts", "Basic analytics"] },
  pro: { name: "Pro", points: ["Juvo AI chat", "Behavioural insights", "CSV / JSON export"] },
  super: { name: "Super", points: ["Everything in Pro", "Unlimited reviews", "Priority coaching context"] },
};
const planRank: Record<BillingPlan, number> = { free: 0, pro: 1, super: 2 };
function money(amount?: number, currency?: string) {
  return typeof amount === "number" && currency ? formatMoney(amount / 100, currency) : "Configured at checkout";
}
function statusLabel(status?: string) { return status ? status.replaceAll("-", " ") : "Free"; }

export default function SubscriptionsPage() {
  const searchParams = useSearchParams();
  const authUser = useAuthStore((state) => state.user);
  const refreshUser = useAuthStore((state) => state.fetchCurrentUser);
  const [overview, setOverview] = useState<BillingOverview | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const load = useCallback(async () => {
    const current = await getBillingOverviewService();
    setOverview(current);
    return current;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const timer = window.setTimeout(() => {
      void load().catch((cause) => {
        if (!cancelled) setError(getApiErrorMessage(cause, "Unable to load billing details."));
      });
    }, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [load]);

  useEffect(() => {
    const reference = searchParams.get("reference");
    if (!reference) return;
    let cancelled = false;
    const timer = window.setTimeout(() => {
      setBusy("verify");
      setError("");
      void verifyBillingPaymentService(reference)
        .then(async (result) => {
          if (!cancelled) setNotice(result.data?.status === "success" ? "Payment verified. Your plan is now active." : "Payment is still pending. We will update your plan after Paystack confirms it.");
          await Promise.all([load(), refreshUser()]);
        })
        .catch((cause) => { if (!cancelled) setError(getApiErrorMessage(cause, "We could not verify this payment yet.")); })
        .finally(() => { if (!cancelled) setBusy(null); });
    }, 0);
    return () => { cancelled = true; window.clearTimeout(timer); };
  }, [load, refreshUser, searchParams]);

  async function checkout(plan: Exclude<BillingPlan, "free">) {
    if (activeSubscription?.status === "non-renewing" && activeSubscription.plan !== plan && !window.confirm(`Switch to ${planDetails[plan].name} now? This starts its billing period immediately; unused time on ${planDetails[activeSubscription.plan].name} is not credited.`)) return;
    setBusy(plan);
    setError("");
    setNotice("");
    try {
      const result = await initializeBillingCheckoutService(plan);
      window.location.assign(result.authorizationUrl);
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Unable to start checkout."));
      setBusy(null);
    }
  }

  async function reconcile() {
    setBusy("reconcile");
    setError("");
    try {
      setOverview(await reconcileBillingService());
      await refreshUser();
      setNotice("Billing status refreshed from Paystack.");
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Unable to refresh billing status."));
    } finally {
      setBusy(null);
    }
  }

  async function cancel(subscription: BillingSubscription) {
    if (!window.confirm("Cancel future renewal? Your current paid access remains until the listed expiry.")) return;
    setBusy(subscription.id);
    setError("");
    try {
      await cancelBillingSubscriptionService(subscription.id);
      await Promise.all([load(), refreshUser()]);
      setNotice("Renewal cancelled. Your current paid access remains available until its expiry.");
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Unable to cancel renewal."));
    } finally {
      setBusy(null);
    }
  }

  async function manage(subscription: BillingSubscription) {
    setBusy(`manage-${subscription.id}`);
    setError("");
    try {
      window.location.assign((await getBillingManagementLinkService(subscription.id)).url);
    } catch (cause) {
      setError(getApiErrorMessage(cause, "Unable to open Paystack subscription management."));
      setBusy(null);
    }
  }

  const currentPlan = overview?.current?.plan || authUser?.subscription?.plan || "free";
  const activeSubscription = overview?.subscriptions.find((subscription) => ["active", "non-renewing", "past-due"].includes(subscription.status));

  return <DashboardShell><div className="space-y-6">
    <PageHeader eyebrow="General" title="Subscriptions" description="Manage your JUVO plan through secure Paystack checkout. Your journal and trade data stay yours on every tier." />
    {error && <p role="alert" className="text-sm text-rose-700 dark:text-rose-300">{error}</p>}
    {notice && <p role="status" className="text-sm text-cyan-800 dark:text-cyan-300">{notice}</p>}
    <section className="flex flex-wrap items-center justify-between gap-3 border-y border-slate-200 py-4 dark:border-white/10">
      <div><p className="text-sm font-semibold text-slate-950 dark:text-white">Current plan: {planDetails[currentPlan].name}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Status: {statusLabel(overview?.current?.status || authUser?.subscription?.status)}{overview?.current?.expiresAt ? ` · Access until ${formatDate(overview.current.expiresAt, { month: "short", day: "numeric", year: "numeric" })}` : ""}</p></div>
      <Button variant="ghost" disabled={!!busy} onClick={() => void reconcile()}>{busy === "reconcile" ? <LoaderCircle size={16} className="animate-spin" /> : <RefreshCw size={16} />}Refresh billing</Button>
    </section>
    {overview && !overview.enabled && <Card className="p-5"><p className="font-semibold text-slate-950 dark:text-white">Payments are not configured yet</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Your current access is unchanged. An administrator needs to add the Paystack plan configuration before checkout can begin.</p></Card>}
    <div className="grid gap-4 lg:grid-cols-3">{(["free", "pro", "super"] as const).map((plan) => {
      const details = planDetails[plan];
      const option = overview?.plans.find((item) => item.plan === plan);
      const current = currentPlan === plan;
      const isDowngrade = planRank[plan] < planRank[currentPlan];
      return <Card key={plan} className={`p-6 ${current ? "ring-2 ring-primary" : ""}`}>
        <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{details.name}</p>
        <p className="mt-2 text-3xl font-bold text-slate-950 dark:text-white">{plan === "free" ? "Free" : money(option?.amount, option?.currency)}<span className="text-sm font-medium text-slate-400">{plan === "free" ? "" : " / mo"}</span></p>
        <ul className="mt-5 space-y-2 text-sm text-slate-600 dark:text-slate-300">{details.points.map((point) => <li key={point} className="flex items-center gap-2"><Check size={16} className="text-primary" />{point}</li>)}</ul>
        {plan === "free" ? <Button className="mt-6 w-full" variant="ghost" disabled>{current ? "Current plan" : "Available after paid access expires"}</Button> : <Button className="mt-6 w-full" disabled={current || !!busy || !option?.available} onClick={() => void checkout(plan)}>{busy === plan ? <LoaderCircle size={16} className="animate-spin" /> : <CreditCard size={16} />}{current ? "Current plan" : option?.available ? `${isDowngrade ? "Downgrade" : "Upgrade"} to ${details.name}` : "Unavailable"}</Button>}
      </Card>;
    })}</div>
    <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <div><h2 className="text-base font-semibold text-slate-950 dark:text-white">Subscription</h2>{activeSubscription ? <div className="mt-3 border-t border-slate-200 py-4 dark:border-white/10"><p className="text-sm font-medium text-slate-950 dark:text-white">{planDetails[activeSubscription.plan].name} · {statusLabel(activeSubscription.status)}</p><p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{activeSubscription.currentPeriodEnd ? `Next renewal or expiry: ${formatDate(activeSubscription.currentPeriodEnd, { month: "short", day: "numeric", year: "numeric" })}` : "Paystack will provide the next renewal date shortly."}</p><div className="mt-4 flex flex-wrap gap-2"><Button variant="ghost" disabled={!!busy} onClick={() => void manage(activeSubscription)}>{busy === `manage-${activeSubscription.id}` ? <LoaderCircle size={16} className="animate-spin" /> : <ExternalLink size={16} />}Manage payment method</Button>{activeSubscription.status === "active" && <Button variant="ghost" disabled={!!busy} onClick={() => void cancel(activeSubscription)}>Cancel renewal</Button>}</div></div> : <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No active Paystack subscription.</p>}</div>
      <div><h2 className="text-base font-semibold text-slate-950 dark:text-white">Billing history</h2>{overview?.payments.length ? <div className="mt-3 divide-y divide-slate-200 border-y border-slate-200 dark:divide-white/10 dark:border-white/10">{overview.payments.map((payment) => <div key={payment.id} className="flex items-center justify-between gap-3 py-3 text-sm"><div><p className="font-medium text-slate-950 dark:text-white">{planDetails[payment.plan].name} · {money(payment.expectedAmount, payment.currency)}</p><p className="text-xs text-slate-500 dark:text-slate-400">{payment.createdAt ? formatDate(payment.createdAt, { month: "short", day: "numeric", year: "numeric" }) : ""}</p></div><span className="capitalize text-slate-600 dark:text-slate-300">{payment.status}</span></div>)}</div> : <p className="mt-3 text-sm text-slate-500 dark:text-slate-400">No Paystack payments yet.</p>}</div>
    </section>
    <p className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400"><ShieldCheck size={15} />Payment card details are handled by Paystack, never JUVO.</p>
  </div></DashboardShell>;
}
