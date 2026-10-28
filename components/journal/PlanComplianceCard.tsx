"use client";

import Button from "@/components/ui/Button";
import Card from "@/components/ui/Card";
import { getApiErrorMessage } from "@/lib/axios";
import {
  getAiAccessService,
  hasAiFeature,
  planComplianceService,
} from "@/services/ai.service";
import { AiAccess } from "@/types/ai.types";
import { ClipboardCheck, LockKeyhole } from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";

type ComplianceCheck = {
  label?: string;
  status?: string;
  evidence?: string;
  rule?: string;
  reason?: string;
};

type ComplianceResult = {
  followed?: ComplianceCheck[];
  violated?: ComplianceCheck[];
  unknown?: ComplianceCheck[];
  interpretation?: string;
  question?: string;
  counts?: {
    followed?: number;
    violated?: number;
    unknown?: number;
    total?: number;
  };
};

type PlanComplianceCardProps = {
  journalId: string;
  tradeId?: string;
};

function checkTitle(item: ComplianceCheck) {
  return item.label || item.rule || "Rule";
}

function checkDetail(item: ComplianceCheck) {
  return item.evidence || item.reason || "";
}

export default function PlanComplianceCard({
  journalId,
  tradeId,
}: PlanComplianceCardProps) {
  const [access, setAccess] = useState<AiAccess | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ComplianceResult | null>(null);

  useEffect(() => {
    getAiAccessService()
      .then((response) => setAccess(response.data))
      .catch(() => undefined);
  }, []);

  const canUse = hasAiFeature(access, "plan_compliance_check");

  const runCheck = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await planComplianceService({ journalId, tradeId });
      setResult((response.data || null) as ComplianceResult);
    } catch (checkError) {
      setError(
        getApiErrorMessage(
          checkError,
          "Juvo could not review this trade against your plan.",
        ),
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-5">
      <div className="flex items-start gap-3">
        <div className="grid h-9 w-9 place-items-center rounded-xl bg-primary/15 text-primary">
          <ClipboardCheck size={18} />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="text-lg font-bold text-slate-950 dark:text-white">
            Plan compliance
          </h2>
          <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
            Compare this journaled session with your recorded trading plan.
          </p>
        </div>
      </div>

      {!canUse ? (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 px-3 py-3 text-sm text-slate-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-300">
          <div className="flex items-center gap-2 font-semibold">
            <LockKeyhole size={14} />
            Pro and Super
          </div>
          <p className="mt-1">
            Upgrade to review trades against your own plan rules.
          </p>
          <Link
            href="/home/general/subscriptions"
            className="mt-2 inline-block font-semibold text-primary"
          >
            View plans
          </Link>
        </div>
      ) : (
        <div className="mt-4">
          <Button
            type="button"
            className="h-9 px-3 text-sm"
            disabled={loading}
            onClick={() => void runCheck()}
          >
            {loading ? "Reviewing..." : result ? "Refresh review" : "Review vs plan"}
          </Button>
        </div>
      )}

      {error ? (
        <p className="mt-3 text-sm text-rose-700 dark:text-rose-300">{error}</p>
      ) : null}

      {result ? (
        <div className="mt-4 space-y-3 text-sm">
          {result.counts ? (
            <p className="text-slate-500 dark:text-slate-400">
              {result.counts.followed || 0} followed · {result.counts.violated || 0}{" "}
              not followed · {result.counts.unknown || 0} unverified
            </p>
          ) : null}
          {result.interpretation ? (
            <p className="leading-6 text-slate-600 dark:text-slate-300">
              {result.interpretation}
            </p>
          ) : null}
          {[
            {
              label: "Followed",
              items: result.followed || [],
              tone: "text-emerald-700 dark:text-emerald-300",
            },
            {
              label: "Apparently not followed",
              items: result.violated || [],
              tone: "text-rose-700 dark:text-rose-300",
            },
            {
              label: "Could not verify",
              items: result.unknown || [],
              tone: "text-amber-700 dark:text-amber-300",
            },
          ].map((group) =>
            group.items.length ? (
              <div key={group.label}>
                <p className={`font-semibold ${group.tone}`}>{group.label}</p>
                <ul className="mt-1 space-y-1 text-slate-600 dark:text-slate-300">
                  {group.items.map((item, index) => (
                    <li key={`${group.label}-${index}`}>
                      {checkTitle(item)}
                      {checkDetail(item) ? ` — ${checkDetail(item)}` : null}
                    </li>
                  ))}
                </ul>
              </div>
            ) : null,
          )}
          {result.question ? (
            <p className="rounded-xl border border-primary/20 bg-primary/5 px-3 py-2 text-slate-700 dark:border-primary/30 dark:bg-primary/10 dark:text-slate-200">
              {result.question}
            </p>
          ) : null}
        </div>
      ) : null}
    </Card>
  );
}
