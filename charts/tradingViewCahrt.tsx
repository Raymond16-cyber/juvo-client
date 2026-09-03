"use client";

import { useThemeStore } from "@/stores/theme.store";
import { memo, useEffect, useRef } from "react";

const JUVO = {
  primary: "#00D4FF",
  accent: "#0066FF",
  danger: "#EF4444",
  light: {
    background: "#FFFFFF",
    text: "#0F172A",
    muted: "#64748B",
    grid: "rgba(15, 23, 42, 0.08)",
    border: "rgba(15, 23, 42, 0.10)",
  },
  dark: {
    background: "#0B1220",
    text: "#FFFFFF",
    muted: "#9CA3AF",
    grid: "rgba(0, 212, 255, 0.10)",
    border: "rgba(255, 255, 255, 0.10)",
  },
};

function getChartConfig(isDark: boolean) {
  const theme = isDark ? JUVO.dark : JUVO.light;
  const overrides = {
    "paneProperties.background": theme.background,
    "paneProperties.backgroundType": "solid",
    "paneProperties.vertGridProperties.color": theme.grid,
    "paneProperties.horzGridProperties.color": theme.grid,
    "scalesProperties.backgroundColor": theme.background,
    "scalesProperties.lineColor": theme.border,
    "scalesProperties.textColor": theme.muted,
    "scalesProperties.showSeriesLastValue": true,
    "mainSeriesProperties.showCountdown": true,
    "mainSeriesProperties.showPriceLine": true,
    "mainSeriesProperties.statusViewStyle.showInterval": true,
  };

  return {
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
    timezone: "exchange",
    backgroundColor: theme.background,
    gridColor: theme.grid,
    toolbar_bg: theme.background,
    support_host: "https://www.tradingview.com",
    loading_screen: {
      backgroundColor: theme.background,
      foregroundColor: JUVO.primary,
    },
    watchlist: [
      "BITSTAMP:BTCUSD",
      "BITSTAMP:ETHUSD",
      "FX:EURUSD",
      "TVC:GOLD",
      "NASDAQ:AAPL",
    ],
    withdateranges: true,
    compareSymbols: [],
    time_frames: [
      { text: "1m", resolution: "1", description: "1 Minute" },
      { text: "5m", resolution: "5", description: "5 Minutes" },
      { text: "15m", resolution: "15", description: "15 Minutes" },
      { text: "30m", resolution: "30", description: "30 Minutes" },
      { text: "1h", resolution: "60", description: "1 Hour" },
      { text: "4h", resolution: "240", description: "4 Hours" },
      { text: "1D", resolution: "D", description: "1 Day" },
      { text: "1W", resolution: "W", description: "1 Week" },
      { text: "1M", resolution: "M", description: "1 Month" },
    ],
    enabled_features: [
      "header_widget",
      "header_symbol_search",
      "header_resolutions",
      "header_interval_dialog_button",
      "header_chart_type",
      "header_indicators",
      "header_compare",
      "header_undo_redo",
      "header_screenshot",
      "header_fullscreen_button",
      "left_toolbar",
      "control_bar",
      "timeframes_toolbar",
      "edit_buttons_in_legend",
      "context_menus",
      "scales_context_menu",
      "side_toolbar_in_fullscreen_mode",
      "show_interval_dialog_on_key_press",
      "countdown",
    ],
    disabled_features: [
      "hide_left_toolbar_by_default",
      "header_saveload",
      "use_localstorage_for_settings",
    ],
    overrides,
    settings_overrides: {
      "mainSeriesProperties.showCountdown": true,
      "scalesProperties.showSeriesLastValue": true,
    },
  };
}

function JuvoChart() {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const resolved = useThemeStore((state) => state.resolved);
  const isDark = resolved === "dark";

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    container.innerHTML = "";

    const widgetHost = document.createElement("div");
    widgetHost.className = "tradingview-widget-container__widget";
    widgetHost.style.height = "100%";
    widgetHost.style.width = "100%";

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-advanced-chart.js";
    script.type = "text/javascript";
    script.async = true;
    script.innerHTML = JSON.stringify(getChartConfig(isDark));

    container.appendChild(widgetHost);
    container.appendChild(script);

    return () => {
      container.innerHTML = "";
    };
  }, [isDark]);

  return (
    <div className="h-full min-h-[560px] w-full overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-white/10 dark:bg-card">
      <div
        ref={containerRef}
        className="tradingview-widget-container h-full w-full [&_.tradingview-widget-copyright]:hidden"
        style={{ height: "100%", width: "100%" }}
      />
    </div>
  );
}

export default memo(JuvoChart);
