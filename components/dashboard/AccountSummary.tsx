import AccountSwitcher from "@/components/dashboard/AccountSwitcher";
import { formatMoney, formatNumber } from "@/lib/format";
import { panelTransition } from "@/lib/motion";
import { TradingAccount } from "@/types/trading-account.types";
import { motion } from "framer-motion";
import { WalletCards } from "lucide-react";
import Link from "next/link";

type AccountSummaryProps = {
  account?: TradingAccount | null;
  livePnl?: number;
};

export default function AccountSummary({ account, livePnl = 0 }: AccountSummaryProps) {
  const equity = account?.currentEquity ?? account?.currentBalance ?? 0;
  const balance = account?.currentBalance ?? 0;
  const target = account?.profitTarget || 0;
  const maxDrawdown = account?.maxDrawnDown || 0;
  const profitPercent = account?.profitPercent || 0;
  const targetProgress = target
    ? Math.min(100, Math.max(0, (profitPercent / target) * 100))
    : Math.max(0, profitPercent);
  const drawdownProgress = maxDrawdown
    ? Math.min(100, Math.max(0, ((account?.drawdownPercent || 0) / maxDrawdown) * 100))
    : Math.max(0, account?.drawdownPercent || 0);
  const status = account?.status || "Active";
  const pnlTone =
    livePnl > 0 ? "text-profit" : livePnl < 0 ? "text-loss" : "text-slate-200";

  return (
    <section
      data-dashboard-card
      className="dashboard-card rounded-card border border-slate-800 bg-slate-950 p-4 text-white dark:border-border dark:bg-card sm:p-4"
    >
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.12em] text-slate-400">
            {account ? `${account.accountName} · ${account.broker}` : "Primary account"}
          </p>
          <h2 className="mt-1.5 text-2xl font-semibold tracking-tight tabular-nums">
            {account
              ? `${account.accountCurrency || account.currency} ${formatNumber(equity)}`
              : "No account yet"}
          </h2>
          {account ? (
            <p className="mt-1.5 text-xs font-medium text-slate-400">
              {account.isActive ? "Active" : "Inactive"} · {status}
              {typeof account.tradesCount === "number"
                ? ` · ${account.tradesCount} trades`
                : ""}
            </p>
          ) : null}
        </div>
        <div className="grid h-9 w-9 place-items-center rounded-control border border-white/10 bg-white/5 text-primary">
          <WalletCards size={16} />
        </div>
      </div>

      <div className="mt-4 grid gap-2 sm:grid-cols-3 xl:grid-cols-1 2xl:grid-cols-3">
        {[
          [
            "Balance",
            account
              ? formatMoney(balance, account.accountCurrency || account.currency)
              : "—",
            "text-white",
          ],
          [
            "Equity",
            account ? formatMoney(equity, account.accountCurrency || account.currency) : "—",
            "text-white",
          ],
          [
            "Floating P/L",
            account ? formatMoney(livePnl, account.accountCurrency || account.currency) : "—",
            pnlTone,
          ],
        ].map(([label, value, tone]) => (
          <div key={label} className="rounded-control border border-white/10 bg-white/[0.04] p-2.5">
            <p className="text-[10px] uppercase tracking-[0.08em] text-slate-400">{label}</p>
            <p className={`mt-0.5 text-sm font-semibold tabular-nums ${tone}`}>{value}</p>
          </div>
        ))}
      </div>

      <div className="mt-4 space-y-3">
        <div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-300">
              {target ? `Profit target ${target}%` : "Account progress"}
            </span>
            <span className="font-semibold tabular-nums text-primary">
              {Math.round(targetProgress)}%
            </span>
          </div>
          <div className="mt-2 h-1.5 rounded-full bg-white/10">
            <motion.div
              className="h-full rounded-full bg-primary"
              initial={false}
              animate={{ width: `${targetProgress}%` }}
              transition={panelTransition}
            />
          </div>
        </div>
        {maxDrawdown ? (
          <div>
            <div className="flex items-center justify-between text-sm">
              <span className="text-slate-300">Max drawdown {maxDrawdown}%</span>
              <span className="font-semibold tabular-nums text-loss">
                {Math.round(drawdownProgress)}%
              </span>
            </div>
            <div className="mt-2 h-1.5 rounded-full bg-white/10">
              <motion.div
                className="h-full rounded-full bg-loss"
                initial={false}
                animate={{ width: `${drawdownProgress}%` }}
                transition={panelTransition}
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
