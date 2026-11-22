"use client";

import Card from "@/components/ui/Card";
import { cn } from "@/lib/ui";
import { interactionTransition } from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { useId, useState } from "react";

type ExpandableCardProps = {
  title: React.ReactNode;
  summary?: React.ReactNode;
  children: React.ReactNode;
  defaultOpen?: boolean;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  className?: string;
  headerClassName?: string;
};

export default function ExpandableCard({
  title,
  summary,
  children,
  defaultOpen = false,
  open: controlledOpen,
  onOpenChange,
  className,
  headerClassName,
}: ExpandableCardProps) {
  const [uncontrolledOpen, setUncontrolledOpen] = useState(defaultOpen);
  const open = controlledOpen ?? uncontrolledOpen;
  const panelId = useId();

  const setOpen = (next: boolean) => {
    onOpenChange?.(next);
    if (controlledOpen === undefined) setUncontrolledOpen(next);
  };

  return (
    <Card className={cn("overflow-hidden p-0", className)} interactive={false}>
      <button
        type="button"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen(!open)}
        className={cn(
          "flex w-full items-center justify-between gap-3 px-4 py-3.5 text-left transition-colors hover:bg-slate-50 dark:hover:bg-white/[0.03]",
          headerClassName,
        )}
      >
        <span className="min-w-0">
          <span className="block text-sm font-semibold text-slate-950 dark:text-white">
            {title}
          </span>
          {summary && !open ? (
            <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
              {summary}
            </span>
          ) : null}
        </span>
        <motion.span
          animate={{ rotate: open ? 180 : 0 }}
          transition={interactionTransition(0.18)}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-control border border-border text-slate-500"
        >
          <ChevronDown size={16} />
        </motion.span>
      </button>
      <AnimatePresence initial={false}>
        {open ? (
          <motion.div
            id={panelId}
            key="content"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={interactionTransition(0.2)}
            className="overflow-hidden border-t border-border"
          >
            <div className="px-4 py-3.5">{children}</div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </Card>
  );
}
