"use client";

import { animateNoticeIn, animateNoticeOut } from "@/animations/notice";
import {
  showAccountOutcomeNotice,
  useNoticeStore,
  type JuvoNotice,
  type JuvoNoticeTone,
} from "@/stores/notice.store";
import { useAccountsStore } from "@/stores/accounts.store";
import { ShieldAlert, Trophy, Info, CircleCheck, TriangleAlert, X } from "lucide-react";
import { useCallback, useEffect, useRef } from "react";
import Link from "next/link";

const toneStyles: Record<
  JuvoNoticeTone,
  { wrap: string; icon: string; Icon: typeof Info }
> = {
  breached: {
    wrap: "border-loss/40",
    icon: "bg-loss/10 text-loss",
    Icon: ShieldAlert,
  },
  passed: {
    wrap: "border-primary/40",
    icon: "bg-primary/10 text-primary-strong dark:text-primary",
    Icon: Trophy,
  },
  success: {
    wrap: "border-profit/40",
    icon: "bg-profit/10 text-profit",
    Icon: CircleCheck,
  },
  warning: {
    wrap: "border-warning/40",
    icon: "bg-warning/10 text-warning",
    Icon: TriangleAlert,
  },
  info: {
    wrap: "border-border",
    icon: "bg-slate-100 text-slate-600 dark:bg-white/[0.06] dark:text-slate-300",
    Icon: Info,
  },
};

function NoticeCard({ notice }: { notice: JuvoNotice }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const leavingRef = useRef(false);
  const dismissNotice = useNoticeStore((state) => state.dismissNotice);
  const tone = toneStyles[notice.tone];
  const Icon = tone.Icon;

  const dismiss = useCallback(async () => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    await animateNoticeOut(rootRef.current);
    dismissNotice(notice.id);
  }, [dismissNotice, notice.id]);

  useEffect(() => {
    const stop = animateNoticeIn(rootRef.current);
    const timeout =
      notice.duration > 0
        ? window.setTimeout(() => {
            void dismiss();
          }, notice.duration)
        : undefined;

    return () => {
      stop();
      if (timeout) window.clearTimeout(timeout);
    };
  }, [dismiss, notice.duration, notice.id]);

  return (
    <div ref={rootRef} className="pointer-events-auto w-[min(92vw,420px)]">
      <div
        data-notice-card
        className={`relative overflow-hidden rounded-card border bg-card p-4 shadow-juvo ${tone.wrap}`}
      >
        <div className="relative flex items-start gap-3">
          <span
            data-notice-icon
            className={`grid h-10 w-10 shrink-0 place-items-center rounded-control ${tone.icon}`}
          >
            <Icon size={18} />
          </span>
          <div className="min-w-0 flex-1">
            <p
              data-notice-copy
              className="text-[11px] font-semibold uppercase tracking-[0.14em] text-muted"
            >
              Juvo
            </p>
            <h3
              data-notice-copy
              className="mt-1 text-base font-semibold text-slate-950 dark:text-white"
            >
              {notice.title}
            </h3>
            <p
              data-notice-copy
              className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300"
            >
              {notice.body}
            </p>
            {notice.journalId ? (
              <Link
                href={`/home/journal/${encodeURIComponent(notice.journalId)}`}
                onClick={() => void dismiss()}
                className="mt-3 inline-block text-sm font-semibold text-primary-strong underline underline-offset-4 dark:text-primary"
              >
                Review in journal
              </Link>
            ) : null}
            {!notice.journalId && notice.href ? (
              <Link
                href={notice.href}
                onClick={() => void dismiss()}
                className="mt-3 inline-block text-sm font-semibold text-primary-strong underline underline-offset-4 dark:text-primary"
              >
                {notice.linkLabel || "Open"}
              </Link>
            ) : null}
            {notice.onUndo ? (
              <button
                type="button"
                onClick={async () => {
                  await notice.onUndo?.();
                  void dismiss();
                }}
                className="mt-3 inline-flex text-sm font-semibold text-primary-strong underline underline-offset-4 dark:text-primary"
              >
                {notice.undoLabel || "Undo"}
              </button>
            ) : null}
          </div>
          <button
            type="button"
            onClick={() => void dismiss()}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-control text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
            aria-label="Dismiss notice"
          >
            <X size={16} />
          </button>
        </div>
      </div>
    </div>
  );
}

function AccountOutcomeWatcher() {
  const accounts = useAccountsStore((state) => state.accounts);
  const previousRef = useRef<typeof accounts>([]);
  const readyRef = useRef(false);

  useEffect(() => {
    const previous = previousRef.current;
    const isFirstLoad = !readyRef.current;
    readyRef.current = true;

    accounts.forEach((account) => {
      const status = account.status;
      if (status !== "Passed" && status !== "Breached") return;

      const prior = previous.find((item) => item._id === account._id)?.status;
      if (prior === status) return;

      if (isFirstLoad) {
        const updatedAt = account.statusUpdatedAt
          ? new Date(account.statusUpdatedAt).getTime()
          : 0;
        const recent = updatedAt && Date.now() - updatedAt < 48 * 60 * 60 * 1000;
        if (!recent) return;
      }

      showAccountOutcomeNotice(account);
    });

    previousRef.current = accounts;
  }, [accounts]);

  return null;
}

export default function JuvoNoticeHost() {
  const notices = useNoticeStore((state) => state.notices);

  return (
    <>
      <AccountOutcomeWatcher />
      {notices.length ? (
        <div className="pointer-events-none fixed inset-0 z-[80] flex items-center justify-center p-4">
          <div className="flex flex-col items-center gap-3">
            {notices.map((notice) => (
              <NoticeCard key={notice.id} notice={notice} />
            ))}
          </div>
        </div>
      ) : null}
    </>
  );
}
