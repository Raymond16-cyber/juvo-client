"use client";

import Button from "@/components/ui/Button";
import { controlClassName } from "@/lib/ui";
import { AiAccess } from "@/types/ai.types";
import {
  ScreenshotReviewSections,
  TradeScreenshotAnalysis,
} from "@/types/journal.types";
import {
  ChevronDown,
  ImagePlus,
  Lock,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";
import Link from "next/link";
import { ChangeEvent, useEffect, useId, useMemo, useState } from "react";

const REVIEW_SECTIONS: Array<{
  key: keyof ScreenshotReviewSections;
  label: string;
}> = [
  { key: "chartObservations", label: "Chart observations" },
  { key: "marketStructure", label: "Market structure" },
  { key: "setupAnalysis", label: "Setup analysis" },
  { key: "entryExitReview", label: "Entry and exit review" },
  { key: "riskManagement", label: "Risk management" },
  { key: "whatWentWell", label: "What went well" },
  { key: "whatCouldBeImproved", label: "What could be improved" },
  { key: "keyLesson", label: "Key lesson" },
  { key: "confidenceAndLimitations", label: "Confidence and limitations" },
];

type TradeScreenshotReviewProps = {
  access: AiAccess | null;
  accessLoading?: boolean;
  analysis?: TradeScreenshotAnalysis | null;
  selectedFile: File | null;
  onFileChange: (file: File | null) => void;
  analyzing?: boolean;
  error?: string | null;
  mode?: "picker" | "readonly" | "both";
  onRequestReview?: () => void;
  requestDisabled?: boolean;
};

function entitlementCopy(access: AiAccess | null) {
  if (!access) {
    return {
      title: "AI screenshot review",
      body: "Screenshot review is part of JUVO AI. Check your plan or trial status to unlock it.",
      cta: "Open JUVO AI",
      href: "/home/ai/chat",
    };
  }

  if (access.hasAccess) {
    return null;
  }

  if (access.trial.status === "available") {
    return {
      title: "Unlock screenshot review",
      body: "Start your one-time 3-day JUVO AI trial, or upgrade to Pro or Super, to review chart screenshots when you close a trade.",
      cta: "Start trial",
      href: "/home/ai/chat",
    };
  }

  if (access.trial.status === "expired") {
    return {
      title: "Trial ended",
      body: "Your JUVO AI trial has ended. Upgrade to Pro or Super to keep reviewing trade screenshots.",
      cta: "View plans",
      href: "/home/general/subscriptions",
    };
  }

  return {
    title: "Upgrade required",
    body: "Screenshot review requires an active Pro or Super subscription, or an active JUVO AI trial.",
    cta: "View plans",
    href: "/home/general/subscriptions",
  };
}

export function ScreenshotReviewDisplay({
  analysis,
  defaultOpen = false,
}: {
  analysis: TradeScreenshotAnalysis;
  defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  const panelId = useId();
  const keyLesson = analysis.review.keyLesson?.trim() || "";
  const savedLabel = analysis.analyzedAt
    ? `Saved ${new Date(analysis.analyzedAt).toLocaleString()}`
    : null;

  return (
    <div className="mt-4 overflow-hidden rounded-2xl border border-slate-200 bg-slate-50/80 dark:border-white/10 dark:bg-white/[0.03]">
      <button
        type="button"
        className="flex w-full items-start gap-3 px-4 py-3 text-left transition hover:bg-slate-100/80 dark:hover:bg-white/[0.04]"
        aria-expanded={open}
        aria-controls={panelId}
        onClick={() => setOpen((current) => !current)}
      >
        <Sparkles size={16} className="mt-0.5 shrink-0 text-primary" />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-3">
            <h4 className="text-sm font-bold text-slate-950 dark:text-white">
              AI chart review
            </h4>
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
              {open ? "Hide" : "View"}
              <ChevronDown
                size={16}
                className={`transition-transform ${open ? "rotate-180" : ""}`}
              />
            </span>
          </div>
          {!open ? (
            <>
              {keyLesson ? (
                <p className="mt-1 line-clamp-2 text-sm leading-5 text-slate-600 dark:text-slate-300">
                  {keyLesson}
                </p>
              ) : (
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Chart review saved. Expand to read the full notes.
                </p>
              )}
              {savedLabel ? (
                <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                  {savedLabel}
                </p>
              ) : null}
            </>
          ) : null}
        </div>
        {!open && analysis.imageUrl ? (
          // Signed Cloudinary URL; expires shortly after load.
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={analysis.imageUrl}
            alt=""
            className="h-14 w-20 shrink-0 rounded-lg object-cover bg-white dark:bg-black/20"
          />
        ) : null}
      </button>

      {open ? (
        <div
          id={panelId}
          className="space-y-4 border-t border-slate-200 px-4 py-4 dark:border-white/10"
        >
          {analysis.imageUrl ? (
            // Signed Cloudinary URL; expires shortly after load.
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={analysis.imageUrl}
              alt="Trade chart screenshot"
              className="max-h-72 w-full rounded-xl object-contain bg-white dark:bg-black/20"
            />
          ) : null}
          <div className="space-y-3">
            {REVIEW_SECTIONS.map(({ key, label }) => (
              <div key={key}>
                <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500 dark:text-slate-400">
                  {label}
                </p>
                <p className="juvo-break-words mt-1 whitespace-pre-wrap text-sm leading-6 text-slate-700 dark:text-slate-200">
                  {analysis.review[key]}
                </p>
              </div>
            ))}
          </div>
          {savedLabel ? (
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {savedLabel}
            </p>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}

export default function TradeScreenshotReview({
  access,
  accessLoading = false,
  analysis = null,
  selectedFile,
  onFileChange,
  analyzing = false,
  error = null,
  mode = "both",
  onRequestReview,
  requestDisabled = false,
}: TradeScreenshotReviewProps) {
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const locked = entitlementCopy(access);

  useEffect(() => {
    if (!selectedFile) {
      queueMicrotask(() => setPreviewUrl(null));
      return;
    }
    const url = URL.createObjectURL(selectedFile);
    queueMicrotask(() => setPreviewUrl(url));
    return () => URL.revokeObjectURL(url);
  }, [selectedFile]);

  const showPicker = mode === "picker" || mode === "both";
  const showReadonly = mode === "readonly" || mode === "both";

  const fileLabel = useMemo(() => {
    if (!selectedFile) return "Choose a JPEG, PNG, or WebP chart screenshot up to 5 MB.";
    return `${selectedFile.name} · ${(selectedFile.size / (1024 * 1024)).toFixed(2)} MB`;
  }, [selectedFile]);

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    onFileChange(file);
    event.target.value = "";
  };

  if (accessLoading) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-200 px-4 py-3 text-sm text-slate-500 dark:border-white/10 dark:text-slate-400">
        Checking JUVO AI access…
      </div>
    );
  }

  if (analysis && showReadonly) {
    return <ScreenshotReviewDisplay analysis={analysis} />;
  }

  if (locked && showPicker) {
    return (
      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 px-4 py-4">
        <div className="flex items-start gap-3">
          <Lock size={18} className="mt-0.5 text-amber-600 dark:text-amber-300" />
          <div className="space-y-2">
            <p className="text-sm font-bold text-slate-950 dark:text-white">
              {locked.title}
            </p>
            <p className="text-sm leading-6 text-slate-600 dark:text-slate-300">
              {locked.body}
            </p>
            <Link href={locked.href}>
              <Button variant="ghost" className="h-9 px-3">
                {locked.cta}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!showPicker) return null;

  return (
    <div className="space-y-3 rounded-2xl border border-slate-200 px-4 py-4 dark:border-white/10">
      <div className="flex items-center gap-2">
        <ImagePlus size={16} className="text-primary" />
        <div>
          <p className="text-sm font-bold text-slate-950 dark:text-white">
            Optional AI chart review
          </p>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Closing the trade still works if review fails or is skipped.
          </p>
        </div>
      </div>

      {previewUrl ? (
        // Local object URL for the selected file only.
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={previewUrl}
          alt="Selected chart screenshot preview"
          className="max-h-56 w-full rounded-xl object-contain bg-slate-50 dark:bg-black/20"
        />
      ) : null}

      <p className="juvo-break-words text-xs text-slate-500 dark:text-slate-400">{fileLabel}</p>

      <div className="flex flex-wrap gap-2">
        <label className={`${controlClassName} inline-flex min-h-11 cursor-pointer items-center gap-2 px-3 py-2`}>
          <Upload size={14} className="shrink-0" />
          <span className="min-w-0">{selectedFile ? "Replace screenshot" : "Upload screenshot"}</span>
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            className="hidden"
            disabled={analyzing}
            onChange={handleFileInput}
          />
        </label>
        {selectedFile ? (
          <Button
            type="button"
            variant="ghost"
            className="h-11 px-3"
            disabled={analyzing}
            onClick={() => onFileChange(null)}
          >
            <Trash2 size={14} />
            Remove
          </Button>
        ) : null}
        {onRequestReview && selectedFile ? (
          <Button
            type="button"
            className="h-11 px-3"
            disabled={analyzing || requestDisabled}
            onClick={onRequestReview}
          >
            <Sparkles size={14} />
            {analyzing ? "Analyzing…" : "Run AI review"}
          </Button>
        ) : null}
      </div>

      {analyzing ? (
        <p className="text-sm text-slate-600 dark:text-slate-300">
          Uploading screenshot and generating the review…
        </p>
      ) : null}
      {error ? (
        <p className="text-sm text-rose-600 dark:text-rose-300">{error}</p>
      ) : null}
    </div>
  );
}
