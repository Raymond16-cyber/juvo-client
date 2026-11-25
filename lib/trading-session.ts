export type TradingSession = "Asian" | "Tokyo" | "London" | "New York";

export const TRADING_SESSIONS: TradingSession[] = [
  "Asian",
  "Tokyo",
  "London",
  "New York",
];

export function getCurrentTradingSession(
  date: Date = new Date(),
): TradingSession {
  const sessions: {
    session: TradingSession;
    timeZone: string;
    start: number;
    end: number;
  }[] = [
    { session: "New York", timeZone: "America/New_York", start: 8, end: 17 },
    { session: "London", timeZone: "Europe/London", start: 8, end: 17 },
    { session: "Tokyo", timeZone: "Asia/Tokyo", start: 9, end: 18 },
    { session: "Asian", timeZone: "Australia/Sydney", start: 8, end: 17 },
  ];

  for (const { session, timeZone, start, end } of sessions) {
    const parts = new Intl.DateTimeFormat("en-US", {
      timeZone,
      hour: "2-digit",
      minute: "2-digit",
      hourCycle: "h23",
    })
      .formatToParts(date)
      .filter((part) => part.type === "hour" || part.type === "minute");
    const localMinutes =
      Number(parts.find((part) => part.type === "hour")?.value || 0) * 60 +
      Number(parts.find((part) => part.type === "minute")?.value || 0);

    if (localMinutes >= start * 60 && localMinutes < end * 60) {
      return session;
    }
  }

  return "Asian";
}
