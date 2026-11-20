"use client";

import Button from "@/components/ui/Button";
import { ReactNode } from "react";

type HistoryPreviewProps = {
  title?: string;
  countLabel?: string;
  hasMore: boolean;
  onSeeAll: () => void;
  children: ReactNode;
  seeAllLabel?: string;
};

export default function HistoryPreview({
  title,
  countLabel,
  hasMore,
  onSeeAll,
  children,
  seeAllLabel = "See full history",
}: HistoryPreviewProps) {
  return (
    <div className="min-w-0">
      {(title || countLabel) && (
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          {title ? (
            <h3 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              {title}
            </h3>
          ) : (
            <span />
          )}
          {countLabel ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">{countLabel}</p>
          ) : null}
        </div>
      )}
      {children}
      {hasMore ? (
        <div className="mt-4 flex justify-center border-t border-slate-200 px-4 py-4 dark:border-white/10">
          <Button type="button" variant="ghost" onClick={onSeeAll}>
            {seeAllLabel}
          </Button>
        </div>
      ) : null}
    </div>
  );
}
