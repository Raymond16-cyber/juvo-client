"use client";

import Button from "@/components/ui/Button";
import { getApiErrorMessage } from "@/lib/axios";
import { controlClassName, textareaClassName } from "@/lib/ui";
import {
  getTodayNoTradeDayService,
  upsertNoTradeDayService,
} from "@/services/journal.service";
import {
  NoTradeDayEntry,
  NoTradeDayReason,
} from "@/types/journal.types";
import { AnimatePresence, motion } from "framer-motion";
import { CheckCircle2, Coffee, X } from "lucide-react";
import { FormEvent, useEffect, useState } from "react";
import { createPortal } from "react-dom";

const REASONS: Array<{ value: NoTradeDayReason; label: string }> = [
  {
    value: "no_valid_setup",
    label: "No valid setup appeared",
  },
  {
    value: "followed_plan",
    label: "I followed my plan and stayed out",
  },
  {
    value: "rest_day",
    label: "I chose to rest or take a break",
  },
  {
    value: "market_unsuitable",
    label: "The market was closed or unsuitable",
  },
  {
    value: "other",
    label: "Other",
  },
];

type NoTradeDayModalProps = {
  isOpen: boolean;
  onClose: () => void;
  onSaved?: (entry: NoTradeDayEntry) => void;
  tradingAccountId?: string | null;
};

export default function NoTradeDayModal({
  isOpen,
  onClose,
  onSaved,
  tradingAccountId,
}: NoTradeDayModalProps) {
  const canUseDom = typeof document !== "undefined";
  const [confirmed, setConfirmed] = useState(false);
  const [reason, setReason] = useState<NoTradeDayReason | "">("");
  const [reflection, setReflection] = useState("");
  const [existing, setExisting] = useState<NoTradeDayEntry | null>(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setLoading(true);
    setError(null);
    setSuccess(null);

    getTodayNoTradeDayService()
      .then((response) => {
        if (cancelled) return;
        const entry = response.data.entry;
        setExisting(entry);
        setConfirmed(Boolean(entry?.confirmed) || !entry);
        setReason(entry?.reason || "");
        setReflection(entry?.reflection || "");
      })
      .catch((loadError) => {
        if (cancelled) return;
        setError(
          getApiErrorMessage(loadError, "Unable to load today's no-trade status."),
        );
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [isOpen, onClose]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!existing && !confirmed) {
      setError("Confirm that you did not place any trades today.");
      return;
    }

    setSaving(true);
    setError(null);
    setSuccess(null);
    try {
      const response = await upsertNoTradeDayService({
        confirmed: true,
        reason: reason || null,
        reflection,
        tradingAccount: tradingAccountId || null,
      });
      setExisting(response.data.entry);
      setSuccess(
        response.data.message ||
          "No-trade day recorded. Your journaling streak is up to date.",
      );
      onSaved?.(response.data.entry);
    } catch (saveError) {
      setError(
        getApiErrorMessage(saveError, "Unable to save your no-trade day."),
      );
    } finally {
      setSaving(false);
    }
  };

  if (!canUseDom) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen ? (
        <div className="fixed inset-0 z-[110] flex items-end justify-center p-4 sm:items-center">
          <motion.button
            type="button"
            aria-label="Close no-trade day dialog"
            className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="no-trade-day-title"
            className="relative z-10 w-full max-w-lg overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1220]"
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
          >
            <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-5 py-4 dark:border-white/10">
              <div className="flex items-start gap-3">
                <span className="grid h-10 w-10 place-items-center rounded-2xl bg-orange-500/15 text-orange-600 dark:text-orange-300">
                  <Coffee size={18} />
                </span>
                <div>
                  <h2
                    id="no-trade-day-title"
                    className="text-lg font-bold text-slate-950 dark:text-white"
                  >
                    {existing ? "No-trade day logged" : "No Trade Today"}
                  </h2>
                  <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                    Record a deliberate decision to stay out of the market. This
                    is journaling, not a trade.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-9 w-9 place-items-center rounded-full border border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-300"
                aria-label="Close"
              >
                <X size={16} />
              </button>
            </div>

            <form className="space-y-4 px-5 py-5" onSubmit={handleSubmit}>
              {loading ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Checking today's status…
                </p>
              ) : (
                <>
                  {existing ? (
                    <div className="flex items-start gap-2 rounded-2xl bg-emerald-500/10 px-3 py-2 text-sm text-emerald-700 dark:text-emerald-300">
                      <CheckCircle2 size={16} className="mt-0.5 shrink-0" />
                      <span>
                        No-trade day logged ✓
                        {existing.supersededByTrade
                          ? " A trade was later recorded for this day, so this declaration is marked superseded."
                          : " You can update the reason or reflection below."}
                      </span>
                    </div>
                  ) : (
                    <label className="flex items-start gap-3 rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm dark:border-white/10 dark:bg-white/[0.04]">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={confirmed}
                        onChange={(event) => setConfirmed(event.target.checked)}
                        required
                      />
                      <span className="font-semibold text-slate-800 dark:text-slate-100">
                        I did not place any trades today.
                      </span>
                    </label>
                  )}

                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Reason (optional)
                    <select
                      className={`mt-2 ${controlClassName}`}
                      value={reason}
                      onChange={(event) =>
                        setReason(event.target.value as NoTradeDayReason | "")
                      }
                    >
                      <option value="">Select a reason</option>
                      {REASONS.map((item) => (
                        <option key={item.value} value={item.value}>
                          {item.label}
                        </option>
                      ))}
                    </select>
                  </label>

                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-200">
                    Reflection (optional)
                    <textarea
                      className={`mt-2 ${textareaClassName}`}
                      value={reflection}
                      onChange={(event) => setReflection(event.target.value)}
                      placeholder="What did you observe, or why staying out was the disciplined choice?"
                    />
                  </label>
                </>
              )}

              {error ? (
                <p className="text-sm text-rose-600 dark:text-rose-300" role="alert">
                  {error}
                </p>
              ) : null}
              {success ? (
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {success}
                </p>
              ) : null}

              <div className="flex flex-wrap justify-end gap-2 pt-1">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={onClose}
                  disabled={saving}
                >
                  Close
                </Button>
                <Button type="submit" disabled={loading || saving}>
                  {saving
                    ? "Saving…"
                    : existing
                      ? "Update no-trade day"
                      : "Save no-trade day"}
                </Button>
              </div>
            </form>
          </motion.div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
