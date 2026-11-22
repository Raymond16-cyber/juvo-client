"use client";

import { cn } from "@/lib/ui";
import { AnimatePresence, motion } from "framer-motion";
import { dropdownTransition } from "@/lib/motion";
import { useState } from "react";

type HoverPreviewProps = {
  children: React.ReactNode;
  preview: React.ReactNode;
  className?: string;
  previewClassName?: string;
};

/** Desktop hover / keyboard-focus contextual preview. Touch taps ignore hover. */
export default function HoverPreview({
  children,
  preview,
  className,
  previewClassName,
}: HoverPreviewProps) {
  const [open, setOpen] = useState(false);

  return (
    <div
      className={cn("relative", className)}
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      {children}
      <AnimatePresence>
        {open ? (
          <motion.div
            role="tooltip"
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={dropdownTransition}
            className={cn(
              "pointer-events-none absolute left-0 top-full z-30 mt-2 hidden w-[min(20rem,80vw)] rounded-control border border-border bg-card p-3 text-sm shadow-juvo md:block",
              previewClassName,
            )}
          >
            {preview}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
