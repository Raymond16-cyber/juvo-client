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
import { useEffect, useRef } from "react";

const toneStyles: Record<
  JuvoNoticeTone,
  { wrap: string; icon: string; Icon: typeof Info }
> = {
  breached: {
    wrap: "border-rose-400/40 from-rose-500/20 to-transparent",
    icon: "bg-rose-500/15 text-rose-500 dark:text-rose-300",
    Icon: ShieldAlert,
  },
  passed: {
    wrap: "border-primary/40 from-primary/20 to-transparent",
    icon: "bg-primary/15 text-primary",
    Icon: Trophy,
  },
  success: {
    wrap: "border-emerald-400/40 from-emerald-500/20 to-transparent",
    icon: "bg-emerald-500/15 text-emerald-500 dark:text-emerald-300",
    Icon: CircleCheck,
  },
  warning: {
    wrap: "border-amber-400/40 from-amber-500/20 to-transparent",
    icon: "bg-amber-500/15 text-amber-500 dark:text-amber-300",
    Icon: TriangleAlert,
  },
  info: {
    wrap: "border-slate-300/50 from-slate-400/15 to-transparent dark:border-white/15",
    icon: "bg-slate-500/10 text-slate-600 dark:text-slate-300",
    Icon: Info,
  },
};

function NoticeCard({ notice }: { notice: JuvoNotice }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const leavingRef = useRef(false);
  const dismissNotice = useNoticeStore((state) => state.dismissNotice);
  const tone = toneStyles[notice.tone];
  const Icon = tone.Icon;

  const dismiss = async () => {
    if (leavingRef.current) return;
    leavingRef.current = true;
    await animateNoticeOut(rootRef.current);
    dismissNotice(notice.id);
  };

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
  }, [notice.id]);

  return (
    <div ref={rootRef} className="pointer-events-auto w-[min(92vw,420px)]">
      <div
        data-notice-card
        className={`relative overflow-hidden rounded-3xl border bg-white/75 p-5 shadow-2xl shadow-slate-950/10 backdrop-blur-xl dark:bg-[#0B1220]/80 dark:shadow-black/40 ${tone.wrap}`}
      >
        <div
          data-notice-glow
          className={`pointer-events-none absolute -left-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-80 blur-2xl ${tone.wrap}`}
        />
        <div className="relative flex items-start gap-4">
          <span
            data-notice-icon
            className={`grid h-12 w-12 shrink-0 place-items-center rounded-2xl ${tone.icon}`}
          >
            <Icon size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <p
              data-notice-copy
              className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400"
            >
              Juvo
            </p>
            <h3
              data-notice-copy
              className="mt-1 text-lg font-bold text-slate-950 dark:text-white"
            >
              {notice.title}
            </h3>
            <p
              data-notice-copy
              className="mt-1 text-sm leading-6 text-slate-600 dark:text-slate-300"
            >
              {notice.body}
            </p>
          </div>
          <button
            type="button"
            onClick={() => void dismiss()}
            className="grid h-8 w-8 shrink-0 place-items-center rounded-full text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/10 dark:hover:text-white"
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
