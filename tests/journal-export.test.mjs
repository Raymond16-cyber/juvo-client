import assert from "node:assert/strict";
import { test } from "node:test";
import { buildJournalCsv, csvCell, filterExportJournals, journalDateKey } from "../lib/journal-export.ts";

const journal = {
  _id: "journal-1", journalDate: "2026-09-12T23:00:00.000Z", status: "Completed", tradingAccount: { _id: "a", accountName: "Account A", currency: "USD" },
  reportingCurrency: "USD", totalProfitLoss: 150, totalProfitLossReporting: 160, conversionUnavailableCount: 0, openTrades: 0, closedTrades: 2,
  trades: [
    { _id: "t1", symbol: "EURUSD", direction: "long", status: "Closed", tradingAccount: { _id: "a", accountName: "Account A", currency: "USD" }, profitLoss: 100, profitLossReporting: 100, plannedRR: 20, achievedRR: 0, notes: 'Plan, then "execute"\nReview' },
    { _id: "t2", symbol: "GBPUSD", direction: "short", status: "Breakeven", tradingAccount: { _id: "b", accountName: "Account B", currency: "EUR" }, profitLoss: 50, profitLossReporting: 60 },
  ],
};

test("date filters follow the user's journal timezone, with inclusive bounds", () => {
  assert.equal(journalDateKey(journal.journalDate, "Africa/Lagos"), "2026-09-13");
  assert.equal(filterExportJournals([journal], { accountId: "", from: "2026-09-13", to: "2026-09-13" }, "Africa/Lagos").length, 1);
  assert.equal(filterExportJournals([journal], { accountId: "", from: "", to: "2026-09-12" }, "Africa/Lagos").length, 0);
});

test("mixed-account sessions are filtered at trade level and reporting totals are recalculated", () => {
  const filtered = filterExportJournals([journal], { accountId: "b", from: "", to: "" }, "Africa/Lagos");
  assert.equal(filtered[0].trades.length, 1);
  assert.equal(filtered[0].totalProfitLossReporting, 60);
  assert.equal(filtered[0].closedTrades, 1);
  assert.equal(journal.trades.length, 2);
});

test("CSV escapes quotes and multiline text, protects formula cells, and keeps negative numbers numeric", () => {
  assert.equal(csvCell('Plan, then "execute"\nReview'), '"Plan, then ""execute""\nReview"');
  for (const value of ["=1+2", " +SUM(A1:A2)", "@SUM(A1)", "-cmd", "\tunsafe"]) assert.ok(csvCell(value).startsWith('"\''));
  assert.equal(csvCell(-12.5), "-12.5");
  assert.equal(csvCell(Infinity), "");
});

test("trade CSV contains native and reporting currencies and preserves zero achieved RR", () => {
  const csv = buildJournalCsv([journal], "Africa/Lagos", "trades");
  assert.ok(csv.startsWith("\uFEFF"));
  assert.ok(csv.includes('20,0,100,"USD",100,"USD"'));
  assert.ok(csv.includes('50,"EUR",60,"USD"'));
});

test("missing FX leaves session reporting P/L blank while native trade P/L remains exportable", () => {
  const partial = { ...journal, conversionUnavailableCount: 1, trades: [{ ...journal.trades[0], profitLossReporting: null }] };
  assert.ok(buildJournalCsv([partial], "Africa/Lagos", "journals").includes(',,"USD",1,'));
  assert.ok(buildJournalCsv([partial], "Africa/Lagos", "trades").includes('100,"USD",,"USD"'));
});
