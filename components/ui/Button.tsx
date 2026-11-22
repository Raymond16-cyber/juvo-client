"use client";

import { cn } from "@/lib/ui";
import { Check, LoaderCircle, X } from "lucide-react";
import React, { useEffect, useState } from "react";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger" | "onDark";
type ButtonStatus = "idle" | "loading" | "success" | "error";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  /** Controlled async status. When omitted, use `loading` for a simple busy state. */
  status?: ButtonStatus;
  loading?: boolean;
  successLabel?: string;
  errorLabel?: string;
};

const variants: Record<ButtonVariant, string> = {
  primary:
    "border border-slate-950 bg-slate-950 text-white hover:bg-slate-800 dark:border-primary dark:bg-primary dark:text-slate-950 dark:hover:bg-secondary",
  secondary:
    "border border-border bg-white text-slate-800 hover:bg-slate-50 dark:bg-white/[0.03] dark:text-slate-100 dark:hover:bg-white/[0.06]",
  ghost:
    "border border-transparent bg-transparent text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-white/[0.06]",
  danger:
    "border border-loss/30 bg-loss text-white hover:brightness-95",
  onDark:
    "border border-white/15 bg-white/5 text-white hover:bg-white/10",
};

export default function Button({
  variant = "primary",
  children,
  className = "",
  type = "button",
  status,
  loading = false,
  successLabel,
  errorLabel,
  disabled,
  ...rest
}: ButtonProps) {
  const resolved: ButtonStatus =
    status || (loading ? "loading" : "idle");
  const [flash, setFlash] = useState<ButtonStatus>("idle");

  useEffect(() => {
    if (resolved !== "success" && resolved !== "error") {
      setFlash("idle");
      return;
    }
    setFlash(resolved);
    const timer = window.setTimeout(() => setFlash("idle"), 1400);
    return () => window.clearTimeout(timer);
  }, [resolved]);

  const shown = flash !== "idle" ? flash : resolved;
  const busy = shown === "loading";
  const isDisabled = Boolean(disabled || busy);

  const content =
    shown === "success" && successLabel
      ? successLabel
      : shown === "error" && errorLabel
        ? errorLabel
        : children;

  return (
    <button
      type={type}
      disabled={isDisabled}
      aria-busy={busy || undefined}
      data-status={shown}
      className={cn(
        "inline-flex min-h-10 items-center justify-center gap-2 rounded-control px-4 py-2 text-sm font-semibold transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-juvo disabled:pointer-events-none disabled:opacity-50",
        variants[variant],
        shown === "success" &&
          "border-profit/40 bg-profit text-white hover:bg-profit",
        shown === "error" &&
          "border-loss/40 bg-loss text-white hover:bg-loss",
        className,
      )}
      {...rest}
    >
      {shown === "loading" ? (
        <LoaderCircle size={16} className="shrink-0 animate-spin" aria-hidden />
      ) : null}
      {shown === "success" && successLabel ? (
        <Check size={16} className="shrink-0" aria-hidden />
      ) : null}
      {shown === "error" && errorLabel ? (
        <X size={16} className="shrink-0" aria-hidden />
      ) : null}
      {content}
    </button>
  );
}
