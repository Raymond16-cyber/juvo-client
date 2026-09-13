import type { JournalDetail, JournalDetailTrade } from "@/types/journal.types";

export type ExportFilters = { accountId: string; from: string; to: string };

export function accountId(value: JournalDetail["tradingAccount"] | JournalDetailTrade["tradingAccount"]) {
  return typeof value === "string" ? value : value?._id || "";
}

export function journalDateKey(value: string, timeZone: string) {
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone, year: "numeric", month: "2-digit", day: "2-digit",
  }).formatToParts(new Date(value));
  const get = (type: string) => parts.find((part) => part.type === type)?.value;
  return `${get("year")}-${get("month")}-${get("day")}`;
}

export function filterExportJournals(journals: JournalDetail[], filters: ExportFilters, timeZone: string) {
  return journals.flatMap((journal) => {
    const day = journalDateKey(journal.journalDate, timeZone);
    if ((filters.from && day < filters.from) || (filters.to && day > filters.to)) return [];
    if (!filters.accountId) return [journal];
    const trades = (journal.trades || []).filter((trade) =>
      accountId(trade.tradingAccount || journal.tradingAccount) === filters.accountId,
    );
    if (!trades.length && accountId(journal.tradingAccount) !== filters.accountId) return [];
    return [{
      ...journal, trades, tradesCount: trades.length,
      openTrades: trades.filter((trade) => trade.status === "Open").length,
      closedTrades: trades.filter((trade) => ["Closed", "Breakeven"].includes(trade.status)).length,
      winningTrades: trades.filter((trade) => trade.profitLoss > 0).length,
      losingTrades: trades.filter((trade) => trade.profitLoss < 0).length,
      totalProfitLoss: trades.reduce((total, trade) => total + trade.profitLoss, 0),
      totalProfitLossReporting: trades.reduce((total, trade) => total + (trade.profitLossReporting ?? 0), 0),
      conversionUnavailableCount: trades.filter((trade) => trade.profitLossReporting == null && trade.profitLoss !== 0).length,
    }];
  });
}

export function csvCell(value: unknown) {
  if (value == null) return "";
  if (typeof value === "number") return Number.isFinite(value) ? String(value) : "";
  let text = String(value);
  // Quoting alone does not stop spreadsheets from evaluating user-entered formulas.
  if (/^[\s\uFEFF]*[=+@-]/u.test(text) || /^[\t\r\n]/u.test(text)) text = `'${text}`;
  return `"${text.replace(/"/g, '""')}"`;
}

export function buildJournalCsv(journals: JournalDetail[], timeZone: string, mode: "journals" | "trades") {
  const rows: unknown[][] = mode === "journals"
    ? [["Date", "Journal ID", "Status", "Trades", "Open", "Closed", "Reporting P/L", "Currency", "Unavailable conversions", "Before trading", "After trading", "Lesson learned"]]
    : [["Journal date", "Trade ID", "Account", "Symbol", "Direction", "Status", "Source", "Opened at", "Closed at", "Entry", "Exit", "Stop loss", "Take profit", "Lot size", "Planned RR", "Achieved RR", "Native P/L", "Native currency", "Reporting P/L", "Reporting currency", "Session", "Notes"]];
  for (const journal of journals) {
    const day = journalDateKey(journal.journalDate, timeZone);
    if (mode === "journals") {
      rows.push([day, journal._id, journal.status, journal.trades?.length || 0, journal.openTrades, journal.closedTrades,
        journal.conversionUnavailableCount ? null : journal.totalProfitLossReporting, journal.reportingCurrency,
        journal.conversionUnavailableCount || 0, journal.psychology?.beforeTrading, journal.psychology?.afterTrading, journal.review?.lessonLearned]);
      continue;
    }
    for (const trade of journal.trades || []) {
      const account = trade.tradingAccount || journal.tradingAccount;
      rows.push([day, trade._id, typeof account === "object" ? account.accountName : account,
        trade.symbol, trade.direction, trade.status, trade.source || "manual", trade.openedAt, trade.closedAt,
        trade.entryPrice, trade.exitPrice, trade.stopLoss, trade.takeProfit, trade.lotSize,
        trade.plannedRR, trade.achievedRR, trade.profitLoss,
        trade.profitLossCurrency || (typeof account === "object" ? account.accountCurrency || account.currency : ""),
        trade.profitLossReporting, journal.reportingCurrency, trade.session, trade.notes]);
    }
  }
  return "\uFEFF" + rows.map((row) => row.map(csvCell).join(",")).join("\r\n");
}
