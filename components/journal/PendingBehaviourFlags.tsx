"use client";

import Button from "@/components/ui/Button";
import { titleCase } from "@/lib/format";
import {
  confirmBehaviourFlagService,
  dismissBehaviourFlagService,
} from "@/services/behaviour.service";
import { BehaviourFlag } from "@/types/behaviour.types";
import { ShieldAlert } from "lucide-react";
import { useState } from "react";

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
  const [resolvedIds, setResolvedIds] = useState<Set<string>>(
    () => new Set(),
  );
  const [error, setError] = useState<string | null>(null);
  const items = flags.filter((flag) => !resolvedIds.has(flag.id));

  if (!items.length) return null;

  const resolve = async (
    flag: BehaviourFlag,
    action: "confirm" | "dismiss",
  ) => {
    if (pendingId) return;
    setPendingId(flag.id);
    setError(null);
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
      setResolvedIds((current) => new Set(current).add(flag.id));
      onResolved?.();
    } catch {
      setError("Could not save your review. Please try again.");
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
            Review prompts are not diagnoses. Confirm if the observation fits,
            or dismiss it if it does not.
          </p>
          {error ? (
            <p className="mt-2 text-sm text-rose-700 dark:text-rose-300" role="alert">
              {error}
            </p>
          ) : null}
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
                {flag.evidence?.description ? (
                  <p className="mt-2 text-sm leading-5 text-slate-700 dark:text-slate-300">
                    <span className="font-medium">
                      {flag.source === "manual"
                        ? "Journal reflection: "
                        : "Recorded signal: "}
                    </span>
                    {flag.evidence.description}
                  </p>
                ) : null}
                {flag.tip ? (
                  <p className="mt-1 text-sm text-slate-600 dark:text-slate-300">
                    {flag.tip}
                  </p>
                ) : null}
                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    type="button"
                    className="min-h-9 px-3 py-1.5 text-xs"
                    disabled={pendingId !== null}
                    onClick={() => resolve(flag, "confirm")}
                  >
                    Confirm
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    className="min-h-9 px-3 py-1.5 text-xs"
                    disabled={pendingId !== null}
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
