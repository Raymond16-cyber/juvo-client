"use client";

import { cn } from "@/lib/ui";
import { dropdownTransition } from "@/lib/motion";
import { AnimatePresence, motion } from "framer-motion";
import { MoreHorizontal } from "lucide-react";
import { useEffect, useId, useRef, useState } from "react";

export type ActionMenuItem = {
  id: string;
  label: string;
  onSelect: () => unknown | Promise<unknown>;
  tone?: "default" | "danger";
  disabled?: boolean;
  icon?: React.ReactNode;
};

type ActionMenuProps = {
  items: ActionMenuItem[];
  label?: string;
  className?: string;
  align?: "left" | "right";
};

export default function ActionMenu({
  items,
  label = "Open actions",
  className,
  align = "right",
}: ActionMenuProps) {
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const onPointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) setOpen(false);
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false);
    };
    window.addEventListener("mousedown", onPointer);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("mousedown", onPointer);
      window.removeEventListener("keydown", onKey);
    };
  }, [open]);

  return (
    <div ref={rootRef} className={cn("relative inline-flex", className)}>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={open}
        aria-controls={menuId}
        aria-label={label}
        onClick={() => setOpen((current) => !current)}
        className="grid h-9 w-9 place-items-center rounded-control border border-border text-slate-500 transition hover:bg-slate-100 hover:text-slate-950 dark:text-slate-300 dark:hover:bg-white/10 dark:hover:text-white"
      >
        <MoreHorizontal size={16} />
      </button>
      <AnimatePresence>
        {open ? (
          <motion.div
            id={menuId}
            role="menu"
            initial={{ opacity: 0, y: 4, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 4, scale: 0.98 }}
            transition={dropdownTransition}
            className={cn(
              "absolute z-40 mt-1 min-w-[10.5rem] overflow-hidden rounded-control border border-border bg-card p-1 shadow-juvo",
              align === "right" ? "right-0" : "left-0",
            )}
          >
            {items.map((item) => (
              <button
                key={item.id}
                type="button"
                role="menuitem"
                disabled={item.disabled}
                onClick={async () => {
                  setOpen(false);
                  await item.onSelect();
                }}
                className={cn(
                  "flex w-full items-center gap-2 rounded-[calc(var(--radius-control)-2px)] px-2.5 py-2 text-left text-sm font-medium transition disabled:opacity-40",
                  item.tone === "danger"
                    ? "text-loss hover:bg-loss/10"
                    : "text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.06]",
                )}
              >
                {item.icon}
                {item.label}
              </button>
            ))}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
