export type TradingSession = "Asian" | "Tokyo" | "London" | "New York";

export const TRADING_SESSIONS: TradingSession[] = [
  "Asian",
  "Tokyo",
  "London",
  "New York",
];

/**
 * Detect the primary forex session from the current UTC clock.
 * Overlaps resolve toward the later, higher-liquidity open
 * (Tokyo → London → New York). Sydney/Asian covers the late UTC evening.
 */
export function getCurrentTradingSession(
  date: Date = new Date(),
): TradingSession {
  const hour = date.getUTCHours();

  // New York cash/FX open window (UTC): ~13:00–21:59
  if (hour >= 13 && hour < 22) return "New York";
  // London open before NY takes priority: ~07:00–12:59
  if (hour >= 7 && hour < 13) return "London";
  // Tokyo / early Asian: ~00:00–06:59
  if (hour >= 0 && hour < 7) return "Tokyo";
  // Sydney / late Asian: ~22:00–23:59
  return "Asian";
}
