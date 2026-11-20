"use client";

import { modalPanelClassName } from "@/lib/responsive";
import { AnimatePresence, motion } from "framer-motion";
import { LoaderCircle, X } from "lucide-react";
import {
  ReactNode,
  useCallback,
  useEffect,
  useRef,
} from "react";
import { createPortal } from "react-dom";

type HistoryModalProps = {
  open: boolean;
  title: string;
  eyebrow?: string;
  onClose: () => void;
  children: ReactNode;
  hasMore?: boolean;
  loadingMore?: boolean;
  onLoadMore?: () => void;
  footer?: ReactNode;
};

export default function HistoryModal({
  open,
  title,
  eyebrow = "History",
  onClose,
  children,
  hasMore = false,
  loadingMore = false,
  onLoadMore,
  footer,
}: HistoryModalProps) {
  const canUseDom = typeof document !== "undefined";
  const sentinelRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [open, onClose]);

  const maybeLoadMore = useCallback(() => {
    if (!hasMore || loadingMore || !onLoadMore) return;
    onLoadMore();
  }, [hasMore, loadingMore, onLoadMore]);

  useEffect(() => {
    if (!open || !hasMore || !onLoadMore) return;
    const node = sentinelRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          maybeLoadMore();
        }
      },
      { root: null, rootMargin: "160px", threshold: 0 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [open, hasMore, onLoadMore, maybeLoadMore, children]);

  if (!canUseDom) return null;

  return createPortal(
    <AnimatePresence>
      {open ? (
        <div className="fixed inset-0 z-[100]">
          <motion.button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default bg-slate-950/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            aria-label="Close history"
            onClick={onClose}
          />

          <div className="pointer-events-none absolute inset-0 flex items-end justify-center px-2 py-3 juvo-safe-pb sm:items-center sm:p-6">
            <motion.div
              className={`${modalPanelClassName} pointer-events-auto flex max-h-[min(92dvh,920px)] flex-col overflow-hidden p-0 sm:p-0`}
              initial={{ opacity: 0, y: 18, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 14, scale: 0.98 }}
              transition={{ duration: 0.22, ease: "easeOut" }}
              role="dialog"
              aria-modal="true"
              aria-labelledby="history-modal-title"
            >
              <div className="flex shrink-0 items-start justify-between gap-4 border-b border-slate-200 px-4 py-4 dark:border-white/10 sm:px-6">
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-primary">{eyebrow}</p>
                  <h2
                    id="history-modal-title"
                    className="mt-1 break-words text-xl font-bold text-slate-950 dark:text-white sm:text-2xl"
                  >
                    {title}
                  </h2>
                </div>
                <button
                  type="button"
                  onClick={onClose}
                  className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-50 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/[0.04]"
                  aria-label="Close"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-4 sm:px-6">
                {children}
                <div ref={sentinelRef} className="h-4 w-full" aria-hidden />
                {loadingMore ? (
                  <div className="flex items-center justify-center gap-2 py-4 text-sm text-slate-500 dark:text-slate-400">
                    <LoaderCircle size={16} className="animate-spin" />
                    Loading more…
                  </div>
                ) : null}
                {!hasMore && !loadingMore ? (
                  <p className="py-3 text-center text-xs text-slate-400 dark:text-slate-500">
                    End of history
                  </p>
                ) : null}
              </div>

              {footer ? (
                <div className="shrink-0 border-t border-slate-200 px-4 py-3 dark:border-white/10 sm:px-6">
                  {footer}
                </div>
              ) : null}
            </motion.div>
          </div>
        </div>
      ) : null}
    </AnimatePresence>,
    document.body,
  );
}
