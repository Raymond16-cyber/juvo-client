"use client";

import { getAccountStatusLabel, getSelectedAccount, isAccountInPlay } from "@/lib/account";
import { controlClassName } from "@/lib/ui";
import { useAccountsStore } from "@/stores/accounts.store";
import { TradingAccount } from "@/types/trading-account.types";
import { WalletCards } from "lucide-react";
import Link from "next/link";
import { useEffect } from "react";

type AccountSwitcherProps = {
  className?: string;
  compact?: boolean;
  onChanged?: (account: TradingAccount) => void;
};

export default function AccountSwitcher({
  className = "",
  compact = false,
  onChanged,
}: AccountSwitcherProps) {
  const accounts = useAccountsStore((state) => state.accounts);
  const selectedAccountId = useAccountsStore((state) => state.selectedAccountId);
  const isLoading = useAccountsStore((state) => state.isLoading);
  const fetchAccounts = useAccountsStore((state) => state.fetchAccounts);
  const selectAccount = useAccountsStore((state) => state.selectAccount);
  const selectedAccount = getSelectedAccount(accounts, selectedAccountId);

  useEffect(() => {
    if (!accounts.length) {
      fetchAccounts().catch(() => undefined);
    }
  }, [accounts.length, fetchAccounts]);

  if (!accounts.length) {
    return (
      <Link
        href="/home/accounts/trading"
        className={`inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-200 ${className}`}
      >
        <WalletCards size={14} />
        Create account
      </Link>
    );
  }

  return (
    <label className={`block min-w-0 ${className}`}>
      {compact ? null : (
        <span className="mb-1 block text-[11px] font-semibold uppercase tracking-wide text-slate-400">
          Trading account
        </span>
      )}
      <select
        className={`${controlClassName} ${compact ? "h-10 min-w-[180px] text-xs" : "h-11"}`}
        value={selectedAccount?._id || ""}
        disabled={isLoading}
        onChange={async (event) => {
          const accountId = event.target.value;
          if (!accountId || accountId === selectedAccount?._id) return;
          const account = await selectAccount(accountId);
          if (account) onChanged?.(account);
        }}
        aria-label="Switch trading account"
      >
        {accounts.map((account) => {
          const status = getAccountStatusLabel(account);
          const inPlay = isAccountInPlay(account);
          return (
            <option key={account._id} value={account._id}>
              {account.accountName} · {account.currency}
              {inPlay ? "" : ` · ${status}`}
            </option>
          );
        })}
      </select>
    </label>
  );
}
