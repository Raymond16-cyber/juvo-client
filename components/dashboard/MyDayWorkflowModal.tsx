"use client";

import MyDayWorkflow from "@/components/dashboard/MyDayWorkflow";
import { AnimatePresence, motion } from "framer-motion";
import { X } from "lucide-react";
import { useEffect } from "react";
import { createPortal } from "react-dom";

type WorkflowPanel = "start" | "trade" | "account";

type MyDayWorkflowModalProps = {
  isOpen: boolean;
  initialPanel: WorkflowPanel;
  onClose: () => void;
  onJournalUpdated?: () => void;
  title?: string;
};

export default function MyDayWorkflowModal({
  isOpen,
  initialPanel,
  onClose,
  onJournalUpdated,
  title = "Create your trading journal",
}: MyDayWorkflowModalProps) {
  const canUseDom = typeof document !== "undefined";

  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") onClose();
    };

    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", handleKeyDown);

    return () => {
      document.body.style.overflow = originalOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!canUseDom) return null;

  return createPortal(
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[100]">
          <motion.button
            type="button"
            className="absolute inset-0 h-full w-full cursor-default bg-slate-950/55 backdrop-blur-sm"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            aria-label="Close journal modal"
            onClick={onClose}
          />

          <div className="pointer-events-none absolute inset-0 flex items-end justify-center px-3 py-4 sm:items-center sm:p-6">
          <motion.div
            className="pointer-events-auto max-h-[92vh] w-full max-w-2xl overflow-y-auto rounded-2xl border border-slate-200 bg-white p-5 text-slate-950 shadow-2xl shadow-slate-950/20 dark:border-white/10 dark:bg-card dark:text-white dark:shadow-black/50 sm:p-6"
            initial={{ opacity: 0, y: 18, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 14, scale: 0.98 }}
            transition={{ duration: 0.22, ease: "easeOut" }}
            role="dialog"
            aria-modal="true"
            aria-labelledby="my-day-modal-title"
          >
            <div className="mb-5 flex items-start justify-between gap-4 border-b border-slate-200 pb-4 dark:border-white/10">
              <div>
                <p className="text-sm font-semibold text-primary">My Day</p>
                <h2
                  id="my-day-modal-title"
                  className="mt-1 text-2xl font-bold text-slate-950 dark:text-white"
                >
                  {title}
                </h2>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 transition hover:bg-slate-100 dark:border-white/10 dark:text-slate-300 dark:hover:bg-white/10"
                aria-label="Close journal modal"
              >
                <X size={18} />
              </button>
            </div>

            <MyDayWorkflow
              key={initialPanel}
              initialPanel={initialPanel}
              mode="modal"
              onJournalUpdated={onJournalUpdated}
            />
          </motion.div>
          </div>
        </div>
      )}
    </AnimatePresence>,
    document.body,
  );
}
