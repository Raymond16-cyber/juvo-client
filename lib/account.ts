import { Goal } from "@/types/goal.types";
import { JournalHistoryItem, JournalSummary } from "@/types/journal.types";
import { TradingAccount } from "@/types/trading-account.types";

export function isAccountInPlay(
  account?: Pick<TradingAccount, "status"> | null,
) {
  return Boolean(account) && (account?.status || "Active") === "Active";
}

export function getSelectedAccount(
  accounts: TradingAccount[],
  selectedAccountId?: string | null,
) {
  return (
    accounts.find((account) => account._id === selectedAccountId) ||
    accounts.find((account) => account.isActive && isAccountInPlay(account)) ||
    accounts.find((account) => isAccountInPlay(account)) ||
    accounts[0] ||
    null
  );
}

export function getRecordAccountId(
  record?: { tradingAccount?: string | { _id: string } | null } | null,
) {
  if (!record?.tradingAccount) return null;
  return typeof record.tradingAccount === "string"
    ? record.tradingAccount
    : record.tradingAccount._id;
}

export function getRecordCurrency(
  record?: { tradingAccount?: string | { currency?: string } | null } | null,
  fallback = "USD",
) {
  if (record?.tradingAccount && typeof record.tradingAccount !== "string") {
    return record.tradingAccount.currency || fallback;
  }
  return fallback;
}

export function filterByAccount<
  T extends {
    tradingAccount?: string | { _id: string } | null;
    trades?: Array<{ tradingAccount?: string | { _id: string } | null }>;
  },
>(items: T[], accountId?: string | null) {
  if (!accountId) return items;
  return items.reduce<T[]>((filtered, item) => {
    const matchingTrades = (item.trades || []).filter(
      (trade) => getRecordAccountId(trade) === accountId,
    );
    const belongsToAccount = getRecordAccountId(item) === accountId;

    if (belongsToAccount) {
      filtered.push(item);
    } else if (matchingTrades.length) {
      filtered.push({ ...item, trades: matchingTrades });
    }

    return filtered;
  }, []);
}

export function getTradableAccounts(accounts: TradingAccount[]) {
  return accounts.filter((account) => isAccountInPlay(account));
}

export function getAccountStatusLabel(
  account?: Pick<TradingAccount, "status"> | null,
) {
  return account?.status || "Active";
}

export function needsNewAccount(accounts: TradingAccount[]) {
  return accounts.length === 0 || getTradableAccounts(accounts).length === 0;
}

export type AccountScopedJournal = JournalSummary | JournalHistoryItem;
export type AccountScopedGoal = Goal;
