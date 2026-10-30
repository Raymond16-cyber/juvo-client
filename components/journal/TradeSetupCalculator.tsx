"use client";

import Button from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/axios";
import { formatMoney } from "@/lib/format";
import { controlClassName } from "@/lib/ui";
import { previewTradeSetupService } from "@/services/journal.service";
import { CreateTradePayload, TradeSetupPreview } from "@/types/journal.types";
import { Calculator, Info } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type TradeSetupCalculatorProps = {
  value: CreateTradePayload;
  onChange: (next: CreateTradePayload) => void;
  tradingAccountId?: string | null;
  accountCurrency?: string;
  disabled?: boolean;
};

const INSTRUMENTS: CreateTradePayload["instrument"][] = [
  "forex",
  "indices",
  "crypto",
  "stocks",
  "commodities",
  "others",
];

export default function TradeSetupCalculator({
  value,
  onChange,
  tradingAccountId,
  accountCurrency = "USD",
  disabled = false,
}: TradeSetupCalculatorProps) {
  const [preview, setPreview] = useState<TradeSetupPreview | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const targetMode = value.targetMode || "rr";
  const sizingMode = value.sizingMode || "auto";

  const patch = (partial: Partial<CreateTradePayload>) => {
    onChange({ ...value, ...partial });
  };

  const canPreview = useMemo(() => {
    return Boolean(
      tradingAccountId &&
        value.symbol &&
        value.instrument &&
        value.direction &&
        Number(value.entryPrice) > 0 &&
        Number(value.stopLoss) > 0 &&
        Number(value.riskPercentage) > 0 &&
        (targetMode === "rr"
          ? Number(value.plannedRR) > 0
          : Number(value.takeProfit) > 0),
    );
  }, [targetMode, tradingAccountId, value]);

  useEffect(() => {
    if (!canPreview || disabled) return;

    let cancelled = false;
    const timer = window.setTimeout(() => {
      setLoading(true);
      setError(null);
      previewTradeSetupService({
        ...value,
        tradingAccount: tradingAccountId || undefined,
        targetMode,
        sizingMode,
      })
        .then((response) => {
          if (cancelled) return;
          const data = response.data;
          setPreview(data);

          const next: Partial<CreateTradePayload> = {};
          if (targetMode === "rr" && data.values?.takeProfit != null) {
            next.takeProfit = data.values.takeProfit;
          }
          if (targetMode === "price" && data.values?.plannedRR != null) {
            next.plannedRR = data.values.plannedRR;
          }
          if (
            sizingMode === "auto" &&
            data.values?.lotSize != null &&
            data.values.lotSize > 0 &&
            data.values.lotSize !== value.lotSize
          ) {
            next.lotSize = data.values.lotSize;
          }
          if (
            targetMode === "rr" &&
            next.takeProfit != null &&
            next.takeProfit === value.takeProfit
          ) {
            delete next.takeProfit;
          }
          if (
            targetMode === "price" &&
            next.plannedRR != null &&
            next.plannedRR === value.plannedRR
          ) {
            delete next.plannedRR;
          }
          if (Object.keys(next).length) {
            onChange({ ...value, ...next, targetMode, sizingMode });
          }
        })
        .catch((previewError) => {
          if (cancelled) return;
          setError(
            getApiErrorMessage(
              previewError,
              "Unable to calculate this trade setup.",
            ),
          );
        })
        .finally(() => {
          if (!cancelled) setLoading(false);
        });
    }, 350);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
    // Intentionally depend on serialized essentials to avoid loops from onChange identity.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    canPreview,
    disabled,
    sizingMode,
    targetMode,
    tradingAccountId,
    value.symbol,
    value.instrument,
    value.direction,
    value.entryPrice,
    value.stopLoss,
    value.takeProfit,
    value.plannedRR,
    value.riskPercentage,
    value.lotSize,
  ]);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-3">
        <input
          className={controlClassName}
          placeholder="Symbol"
          value={value.symbol}
          disabled={disabled}
          onChange={(event) =>
            patch({ symbol: event.target.value.toUpperCase() })
          }
          required
        />
        <select
          className={controlClassName}
          value={value.instrument}
          disabled={disabled}
          onChange={(event) =>
            patch({
              instrument: event.target
                .value as CreateTradePayload["instrument"],
            })
          }
        >
          {INSTRUMENTS.map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <select
          className={controlClassName}
          value={value.direction}
          disabled={disabled}
          onChange={(event) =>
            patch({
              direction: event.target.value as CreateTradePayload["direction"],
            })
          }
        >
          <option value="long">Buy / Long</option>
          <option value="short">Sell / Short</option>
        </select>
        <select
          className={controlClassName}
          value={value.session || "London"}
          disabled={disabled}
          onChange={(event) =>
            patch({
              session: event.target
                .value as CreateTradePayload["session"],
            })
          }
        >
          {["Asian", "Tokyo", "London", "New York"].map((item) => (
            <option key={item} value={item}>
              {item}
            </option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">
            Entry
          </span>
          <input
            className={controlClassName}
            type="number"
            min="0"
            step="any"
            value={value.entryPrice || ""}
            disabled={disabled}
            onChange={(event) =>
              patch({ entryPrice: Number(event.target.value) })
            }
            required
          />
        </label>
        <label className="block">
          <span className="mb-1 block text-xs font-semibold text-slate-500">
            Stop loss
          </span>
          <input
            className={controlClassName}
            type="number"
            min="0"
            step="any"
            value={value.stopLoss || ""}
            disabled={disabled}
            onChange={(event) =>
              patch({ stopLoss: Number(event.target.value) })
            }
            required
          />
        </label>
      </div>

      <label className="block">
        <span className="mb-1 block text-xs font-semibold text-slate-500">
          Risk % of equity
        </span>
        <input
          className={controlClassName}
          type="number"
          min="0"
          step="any"
          value={value.riskPercentage || ""}
          disabled={disabled}
          onChange={(event) =>
            patch({ riskPercentage: Number(event.target.value) })
          }
          required
        />
      </label>

      <div className="flex flex-wrap gap-2">
        <Button
          type="button"
          variant={targetMode === "rr" ? "primary" : "ghost"}
          className="h-9 px-3 text-xs"
          disabled={disabled}
          onClick={() => patch({ targetMode: "rr" })}
        >
          Set RR
        </Button>
        <Button
          type="button"
          variant={targetMode === "price" ? "primary" : "ghost"}
          className="h-9 px-3 text-xs"
          disabled={disabled}
          onClick={() => patch({ targetMode: "price" })}
        >
          Set take-profit
        </Button>
      </div>

      <div className="grid grid-cols-2 gap-3">
        {targetMode === "rr" ? (
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              Planned RR
            </span>
            <input
              className={controlClassName}
              type="number"
              min="0"
              step="any"
              value={value.plannedRR || ""}
              disabled={disabled}
              onChange={(event) =>
                patch({ plannedRR: Number(event.target.value) })
              }
              required
            />
          </label>
        ) : (
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-slate-500">
              Take profit
            </span>
            <input
              className={controlClassName}
              type="number"
              min="0"
              step="any"
              value={value.takeProfit || ""}
              disabled={disabled}
              onChange={(event) =>
                patch({ takeProfit: Number(event.target.value) })
              }
              required
            />
          </label>
        )}
        <label className="block">
          <span className="mb-1 flex items-center justify-between text-xs font-semibold text-slate-500">
            <span>Position size</span>
            <button
              type="button"
              className="font-semibold text-primary"
              disabled={disabled}
              onClick={() =>
                patch({
                  sizingMode: sizingMode === "auto" ? "manual" : "auto",
                })
              }
            >
              {sizingMode === "auto" ? "Auto" : "Manual"}
            </button>
          </span>
          <input
            className={controlClassName}
            type="number"
            min="0"
            step="any"
            value={value.lotSize || ""}
            disabled={disabled || sizingMode === "auto"}
            onChange={(event) =>
              patch({
                lotSize: Number(event.target.value),
                sizingMode: "manual",
              })
            }
            required={sizingMode === "manual"}
          />
        </label>
      </div>

      <div className="rounded-2xl border border-slate-200 bg-slate-50 p-3 text-sm dark:border-white/10 dark:bg-white/[0.04]">
        <div className="mb-2 flex items-center gap-2 font-semibold text-slate-800 dark:text-slate-100">
          <Calculator size={16} className="text-primary" />
          Planned setup
          {loading ? (
            <span className="text-xs font-medium text-slate-400">Updating…</span>
          ) : null}
        </div>
        {error ? (
          <p className="text-rose-600 dark:text-rose-300">{error}</p>
        ) : preview?.values ? (
          <div className="space-y-1 text-slate-600 dark:text-slate-300">
            <p>
              Risk budget:{" "}
              <strong>
                {preview.values.riskAmount != null
                  ? formatMoney(preview.values.riskAmount, accountCurrency)
                  : "—"}
              </strong>
              {preview.values.riskBasis
                ? ` (${preview.values.riskPercentage}% of ${preview.values.riskBasis})`
                : ""}
            </p>
            <p>
              {targetMode === "rr" ? "Take-profit" : "Planned RR"}:{" "}
              <strong>
                {targetMode === "rr"
                  ? preview.values.takeProfit ?? "—"
                  : preview.values.plannedRR ?? "—"}
              </strong>
            </p>
            <p>
              Est. reward at target:{" "}
              <strong>
                {preview.values.estimatedReward != null
                  ? formatMoney(preview.values.estimatedReward, accountCurrency)
                  : "—"}
              </strong>
            </p>
            <p>
              Size:{" "}
              <strong>{preview.values.lotSize ?? value.lotSize ?? "—"}</strong>
              {preview.values.sizingConfidence
                ? ` · ${preview.values.sizingConfidence}`
                : ""}
            </p>
            {preview.values.fx?.rate && preview.values.fx.source !== "same-currency" ? (
              <p className="text-xs text-slate-500">
                Reference FX {preview.values.fx.from}/{preview.values.fx.to}:{" "}
                {preview.values.fx.rate} ({preview.values.fx.source})
              </p>
            ) : null}
          </div>
        ) : (
          <p className="text-slate-500 dark:text-slate-400">
            Enter entry, stop, and risk to calculate size and target.
          </p>
        )}
        {preview?.warnings?.length ? (
          <ul className="mt-2 space-y-1 text-xs text-amber-700 dark:text-amber-300">
            {preview.warnings.map((warning) => (
              <li key={warning} className="flex gap-1.5">
                <Info size={12} className="mt-0.5 shrink-0" />
                <span>{warning}</span>
              </li>
            ))}
          </ul>
        ) : null}
        {preview?.errors?.length ? (
          <ul className="mt-2 space-y-1 text-xs text-rose-600 dark:text-rose-300">
            {preview.errors.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        ) : null}
        <p className="mt-2 text-[11px] leading-5 text-slate-400">
          These are planned estimates only. Realized P/L is recorded when the
          trade is closed.
        </p>
      </div>
    </div>
  );
}
