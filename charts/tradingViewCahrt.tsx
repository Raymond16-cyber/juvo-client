"use client";

import { useThemeStore } from "@/stores/theme.store";
import { memo, useEffect, useRef } from "react";

function JuvoChart() {
  const widgetRef = useRef<HTMLDivElement | null>(null);
  const resolved = useThemeStore((state) => state.resolved);
  const isDark = resolved === "dark";

  useEffect(() => {
    const widget = widgetRef.current;
    if (!widget) return;

    widget.innerHTML = "";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify({
      allow_symbol_change: true,
      autosize: true,
      calendar: true,
      details: true,
      hide_legend: false,
      hide_side_toolbar: false,
      hide_top_toolbar: false,
      hide_volume: false,
      hotlist: true,
      interval: "D",
      locale: "en",
      save_image: true,
      style: "1",
      symbol: "BITSTAMP:BTCUSD",
      theme: isDark ? "dark" : "light",
      show_popup_button: true,
      popup_width: "1000",
      popup_height: "650",
      timezone: "Etc/UTC",
      backgroundColor: isDark ? "#0B1220" : "#FFFFFF",
      gridColor: isDark
        ? "rgba(0, 212, 255, 0.08)"
        : "rgba(15, 23, 42, 0.06)",
      watchlist: [
        "BITSTAMP:BTCUSD",
        "BITSTAMP:ETHUSD",
        "FX:EURUSD",
        "TVC:GOLD",
        "NASDAQ:AAPL",
      ],
      withdateranges: true,
      compareSymbols: [],
      studies: [
        "ROC@tv-basicstudies",
        "StochasticRSI@tv-basicstudies",
        "MASimple@tv-basicstudies",
      ],
    });

    widget.appendChild(script);

    return () => {
      widget.innerHTML = "";
    };
  }, [isDark]);

  return (
    <div className="relative h-full min-h-[420px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-card">
      <div
        ref={widgetRef}
        className="h-full w-full [&_.tradingview-widget-copyright]:hidden"
      />
    </div>
  );
}

export default memo(JuvoChart);


