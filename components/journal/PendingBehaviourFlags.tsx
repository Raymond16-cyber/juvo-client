"use client";

import Button from "@/components/ui/Button";
import { titleCase } from "@/lib/format";
import {
  confirmBehaviourFlagService,
  dismissBehaviourFlagService,
} from "@/services/behaviour.service";
import { BehaviourFlag } from "@/types/behaviour.types";
import { ShieldAlert } from "lucide-react";
import { useEffect, useState } from "react";

type PendingBehaviourFlagsProps = {
  flags: BehaviourFlag[];
  onResolved?: () => void;
  title?: string;
};

export default function PendingBehaviourFlags({
  flags,
  onResolved,
  title = "Suggested behaviour flags",
}: PendingBehaviourFlagsProps) {
  const [pendingId, setPendingId] = useState<string | null>(null);
  const [items, setItems] = useState(flags);

  useEffect(() => {
    setItems(flags);
  }, [flags]);

  if (!items.length) return null;

  const resolve = async (
    flag: BehaviourFlag,
    action: "confirm" | "dismiss",
  ) => {
    if (pendingId) return;
    setPendingId(flag.id);
    try {
      const payload = {
        flagId: flag.id,
        tradeId: flag.tradeId,
        journalId: flag.journalId,
      };
      if (action === "confirm") {
        await confirmBehaviourFlagService(payload);
      } else {
        await dismissBehaviourFlagService(payload);
      }
      setItems((current) => current.filter((item) => item.id !== flag.id));
      onResolved?.();
    } catch {
      // Keep the banner visible if the request fails.
    } finally {
      setPendingId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-amber-200/80 bg-amber-50/80 p-4 dark:border-amber-400/20 dark:bg-amber-400/10">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 shrink-0 place-items-center rounded-xl bg-amber-400/20 text-amber-700 dark:text-amber-200">
          <ShieldAlert size={17} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-bold text-slate-950 dark:text-white">
            {title}
          </p>
          <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
            Auto suggestions only. Confirm if it fits, or dismiss if it does not.
          </p>
          <div className="mt-3 space-y-3">
            {items.map((flag) => (
              <div
                key={flag.id}
                className="rounded-xl border border-amber-200/70 bg-white/80 p-3 dark:border-white/10 dark:bg-black/20"
              >
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-semibold text-slate-950 dark:text-white">
                    {titleCase(flag.challenge)}
                  </p>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:bg-white/10 dark:text-slate-300">
                    {Math.round((flag.confidence || 0) * 100)}% confidence
                  </span>
                  {flag.symbol ? (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {flag.symbol}
                      {flag.direction ? ` · ${flag.direction}` : ""}
                    </span>
                  ) : null}
                </div>
                {flag.tip ? (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {flag.tip}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="min-h-9 px-3 py-1.5 text-xs"
                    disabled={pendingId === flag.id}
                    onClick={() => resolve(flag, "confirm")}
                  >
                    Confirm
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-9 px-3 py-1.5 text-xs"
                    disabled={pendingId === flag.id}
                    onClick={() => resolve(flag, "dismiss")}
                  >
                    Dismiss
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
