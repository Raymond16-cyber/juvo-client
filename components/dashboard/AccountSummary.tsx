import AccountSwitcher from "@/components/dashboard/AccountSwitcher";
import { formatMoney, formatNumber } from "@/lib/format";
import { TradingAccount } from "@/types/trading-account.types";
import { WalletCards } from "lucide-react";
import Link from "next/link";

type AccountSummaryProps = {
  account?: TradingAccount | null;
};

export default function AccountSummary({ account }: AccountSummaryProps) {
  const equity = account?.currentEquity ?? account?.currentBalance ?? 0;
  const balance = account?.currentBalance ?? 0;
  const target = account?.profitTarget || 0;
  const maxDrawdown = account?.maxDrawnDown || 0;
  const progress =
    account && account.initialBalance
      ? Math.min(
          100,
          Math.max(
            0,
            ((equity - account.initialBalance) / account.initialBalance) * 100,
          ),
        )
      : 0;
  const targetProgress = target ? Math.min(100, Math.max(0, (progress / target) * 100)) : progress;
  const drawdownProgress = maxDrawdown
    ? Math.min(100, Math.max(0, ((account?.drawdownPercent || 0) / maxDrawdown) * 100))
    : Math.max(0, account?.drawdownPercent || 0);
  const status = account?.status || "Active";

  return (
    <section
      data-dashboard-card
      className="dashboard-card rounded-2xl border border-slate-200 bg-slate-950 p-7 text-white shadow-sm dark:border-white/10 dark:bg-[#08111f]"
    >
      <div className="flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium text-slate-300">
            {account ? `${account.accountName} · ${account.broker}` : "Primary Account"}
          </p>
          <h2 className="mt-2 text-3xl font-bold">
            {account ? `${account.currency} ${formatNumber(equity)}` : "No account yet"}
          </h2>
          {account ? (
            <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-slate-400">
              {account.isActive ? "Active account" : "Inactive"} · {status}
              {typeof account.tradesCount === "number"
                ? ` · ${account.tradesCount} trades`
                : ""}
            </p>
          ) : null}
        </div>
        <div className="grid h-12 w-12 place-items-center rounded-2xl bg-primary/15 text-primary">
          <WalletCards size={22} />
        </div>
      </div>

      <div className="mt-7 grid gap-3 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
        {[
          ["Balance", account ? formatMoney(balance, account.currency) : "—"],
          ["Equity", account ? formatMoney(equity, account.currency) : "—"],
          ["Type", account?.accountType || "—"],
        ].map(([label, value]) => (
          <div key={label} className="rounded-2xl bg-white/[0.06] p-4">
            <p className="text-xs text-slate-400">{label}</p>
            <p className="mt-1 text-sm font-bold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 space-y-4">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">
              {target ? `Profit target ${target}%` : "Account progress"}
            </span>
            <span className="font-bold text-primary">{Math.round(targetProgress)}%</span>
          </div>
          <div className="mt-2 h-2 rounded-full bg-white/10">
            <div
              className="h-full rounded-full bg-primary"
              style={{ width: `${targetProgress}%` }}
            />
          </div>
        </div>
        {maxDrawdown ? (
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Max drawdown {maxDrawdown}%</span>
              <span className="font-bold text-rose-300">
                {Math.round(drawdownProgress)}%
              </span>
            </div>
            <div className="mt-2 h-2 rounded-full bg-white/10">
              <div
                className="h-full rounded-full bg-rose-400"
                style={{ width: `${drawdownProgress}%` }}
              />
            </div>
          </div>
        ) : null}
      </div>

      <div className="mt-5">
        <AccountSwitcher />
      </div>
      <Link
        href="/home/accounts/trading"
        className="mt-4 inline-flex text-sm font-semibold text-primary"
      >
        Manage accounts
      </Link>
    </section>
  );
}
