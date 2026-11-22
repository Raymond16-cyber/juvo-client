"use client";

import { cn } from "@/lib/ui";
import { interactionTransition } from "@/lib/motion";
import { ChevronRight, LoaderCircle } from "lucide-react";
import { motion } from "framer-motion";
import { useCallback, useRef, useState } from "react";

type SlideToConfirmProps = {
  label: string;
  confirmLabel?: string;
  onConfirm: () => void | Promise<void>;
  disabled?: boolean;
  className?: string;
  /** Use danger styling for destructive actions. */
  tone?: "primary" | "danger";
};

const THRESHOLD = 0.72;

export default function SlideToConfirm({
  label,
  confirmLabel = "Release to confirm",
  onConfirm,
  disabled = false,
  className,
  tone = "primary",
}: SlideToConfirmProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [offset, setOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const [busy, setBusy] = useState(false);
  const startX = useRef(0);
  const maxTravel = useRef(0);

  const reset = useCallback(() => {
    setOffset(0);
    setDragging(false);
  }, []);

  const onPointerDown = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (disabled || busy) return;
    const track = trackRef.current;
    if (!track) return;
    const knob = event.currentTarget;
    maxTravel.current = Math.max(0, track.clientWidth - knob.clientWidth - 8);
    startX.current = event.clientX;
    setDragging(true);
    knob.setPointerCapture(event.pointerId);
  };

  const onPointerMove = (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging || disabled) return;
    const next = Math.min(
      maxTravel.current,
      Math.max(0, event.clientX - startX.current),
    );
    setOffset(next);
  };

  const onPointerUp = async (event: React.PointerEvent<HTMLButtonElement>) => {
    if (!dragging) return;
    event.currentTarget.releasePointerCapture(event.pointerId);
    const ratio = maxTravel.current ? offset / maxTravel.current : 0;
    if (ratio >= THRESHOLD) {
      setBusy(true);
      setOffset(maxTravel.current);
      try {
        await onConfirm();
      } finally {
        setBusy(false);
        reset();
      }
      return;
    }
    reset();
  };

  const progress = maxTravel.current
    ? Math.min(1, offset / maxTravel.current)
    : 0;

  return (
    <div
      ref={trackRef}
      className={cn(
        "relative h-11 overflow-hidden rounded-control border border-border bg-slate-50 dark:bg-white/[0.04]",
        disabled && "opacity-50",
        className,
      )}
    >
      <motion.div
        className={cn(
          "pointer-events-none absolute inset-y-0 left-0",
          tone === "danger" ? "bg-loss/15" : "bg-primary/15",
        )}
        animate={{ width: `${Math.max(progress * 100, 8)}%` }}
        transition={interactionTransition(0.08)}
      />
      <p className="pointer-events-none absolute inset-0 grid place-items-center px-12 text-center text-xs font-semibold text-slate-500 dark:text-slate-400">
        {busy || progress >= THRESHOLD ? confirmLabel : label}
      </p>
      <button
        type="button"
        disabled={disabled || busy}
        aria-label={label}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={reset}
        className={cn(
          "absolute left-1 top-1 z-10 grid h-9 w-9 place-items-center rounded-[calc(var(--radius-control)-2px)] shadow-sm touch-none",
          tone === "danger"
            ? "bg-loss text-white"
            : "bg-slate-950 text-primary dark:bg-primary dark:text-slate-950",
          dragging ? "cursor-grabbing" : "cursor-grab",
        )}
        style={{ transform: `translateX(${offset}px)` }}
      >
        {busy ? (
          <LoaderCircle size={16} className="animate-spin" />
        ) : (
          <ChevronRight size={16} />
        )}
      </button>
    </div>
  );
}
