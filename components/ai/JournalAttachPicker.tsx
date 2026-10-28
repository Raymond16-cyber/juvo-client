"use client";

import { formatDate } from "@/lib/format";
import { useJournalStore } from "@/stores/journal.store";
import type { JournalHistoryItem } from "@/types/journal.types";
import { BookOpenText, Check, Search, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import { createPortal } from "react-dom";

type JournalAttachPickerProps = {
  open: boolean;
  selectedIds: string[];
  onClose: () => void;
  onConfirm: (ids: string[]) => void;
};

function journalLabel(journal: JournalHistoryItem) {
  const note = journal.psychology?.beforeTrading?.trim();
  if (note) return note;
  const symbols = journal.trades?.map((trade) => trade.symbol).filter(Boolean);
  if (symbols?.length) return symbols.slice(0, 3).join(" · ");
  return "Journal session";
}

export default function JournalAttachPicker({
  open,
  selectedIds,
  onClose,
  onConfirm,
}: JournalAttachPickerProps) {
  const journals = useJournalStore((state) => state.journals);
  const getUserJournals = useJournalStore((state) => state.getUserJournals);
  const [query, setQuery] = useState("");
  const [draftIds, setDraftIds] = useState<string[]>(selectedIds);
  const canUseDom = typeof document !== "undefined";

  useEffect(() => {
    if (!open) return;
    setDraftIds(selectedIds);
    setQuery("");
    if (!journals.length) {
      getUserJournals().catch(() => undefined);
    }
  }, [getUserJournals, journals.length, open, selectedIds]);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const source = trimmed
      ? journals.filter((journal) => {
          const haystack = [
            formatDate(journal.journalDate),
            journal.status,
            journal.psychology?.beforeTrading || "",
            ...(journal.trades?.map((trade) => trade.symbol) || []),
          ]
            .join(" ")
            .toLowerCase();
          return haystack.includes(trimmed);
        })
      : journals;
    return source.slice(0, 12);
  }, [journals, query]);

  const toggle = (id: string) => {
    setDraftIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id].slice(0, 8),
    );
  };

  if (!open || !canUseDom) return null;

  return createPortal(
    <div className="fixed inset-0 z-[80] flex items-end justify-center p-3 sm:items-center sm:p-4">
      <button
        type="button"
        className="absolute inset-0 bg-slate-950/55 backdrop-blur-sm"
        aria-label="Close journal picker"
        onClick={onClose}
      />
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="journal-attach-title"
        className="juvo-safe-pb relative z-10 flex max-h-[min(85dvh,720px)] w-full max-w-lg min-w-0 flex-col overflow-hidden rounded-3xl border border-slate-200 bg-white shadow-2xl dark:border-white/10 dark:bg-[#0b1220]"
      >
        <div className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 py-4 sm:px-5 dark:border-white/10">
          <div className="min-w-0">
            <h2
              id="journal-attach-title"
              className="text-lg font-bold text-slate-950 dark:text-white"
            >
              Ask your journal
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Select up to 8 sessions for Juvo to ground on.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="grid h-11 w-11 shrink-0 place-items-center rounded-full border border-slate-200 text-slate-500 dark:border-white/10 dark:text-slate-300"
            aria-label="Close"
          >
            <X size={16} />
          </button>
        </div>

        <div className="border-b border-slate-200 px-4 py-3 sm:px-5 dark:border-white/10">
          <label className="flex min-h-11 items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50 px-3 py-2 dark:border-white/10 dark:bg-white/[0.04]">
            <Search size={16} className="shrink-0 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search journals"
              className="min-w-0 w-full bg-transparent text-sm outline-none"
              autoFocus
            />
          </label>
        </div>

        <div className="min-h-0 flex-1 space-y-2 overflow-y-auto px-4 py-4 sm:px-5">
          {results.length ? (
            results.map((journal) => {
              const selected = draftIds.includes(journal._id);
              return (
                <button
                  key={journal._id}
                  type="button"
                  onClick={() => toggle(journal._id)}
                  className={`flex min-h-11 w-full items-start gap-3 rounded-2xl border px-3 py-3 text-left transition ${
                    selected
                      ? "border-primary bg-primary/10"
                      : "border-slate-200 hover:bg-slate-50 dark:border-white/10 dark:hover:bg-white/[0.04]"
                  }`}
                >
                  <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                    {selected ? <Check size={16} /> : <BookOpenText size={16} />}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block text-sm font-semibold text-slate-950 dark:text-white">
                      {formatDate(journal.journalDate)}
                    </span>
                    <span className="mt-1 block truncate text-xs text-slate-500 dark:text-slate-400">
                      {journalLabel(journal)}
                    </span>
                  </span>
                </button>
              );
            })
          ) : (
            <p className="text-sm text-slate-500 dark:text-slate-400">
              No journals match that search.
            </p>
          )}
        </div>

        <div className="flex items-center justify-between gap-3 border-t border-slate-200 px-4 py-4 sm:px-5 dark:border-white/10">
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">
            {draftIds.length} selected
          </p>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="min-h-11 rounded-full border border-slate-200 px-4 py-2 text-sm font-semibold dark:border-white/10"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={() => onConfirm(draftIds)}
              className="min-h-11 rounded-full bg-primary px-4 py-2 text-sm font-bold text-slate-950"
            >
              Attach
            </button>
          </div>
        </div>
      </div>
    </div>,
    document.body,
  );
}
