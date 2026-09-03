"use client";

import { getRecordCurrency } from "@/lib/account";
import { formatDate, formatMoney, pnlClass } from "@/lib/format";
import { useJournalStore } from "@/stores/journal.store";
import type { JournalHistoryItem } from "@/types/journal.types";
import { BookOpenText, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { FormEvent, useEffect, useMemo, useRef, useState } from "react";

function getAccountName(journal: JournalHistoryItem) {
  if (!journal.tradingAccount || typeof journal.tradingAccount === "string") {
    return "Trading account";
  }

  return `${journal.tradingAccount.accountName} · ${journal.tradingAccount.broker}`;
}

function journalLabel(journal: JournalHistoryItem) {
  const note = journal.psychology?.beforeTrading?.trim();
  if (note) return note;
  const symbols = journal.trades?.map((trade) => trade.symbol).filter(Boolean);
  if (symbols?.length) return symbols.slice(0, 3).join(" · ");
  return getAccountName(journal);
}

function matchesQuery(journal: JournalHistoryItem, query: string) {
  const haystack = [
    formatDate(journal.journalDate),
    journal.status,
    getAccountName(journal),
    journal.psychology?.beforeTrading || "",
    ...(journal.trades?.map((trade) => trade.symbol) || []),
  ]
    .join(" ")
    .toLowerCase();

  return haystack.includes(query);
}

export default function JournalSearch() {
  const router = useRouter();
  const journals = useJournalStore((state) => state.journals);
  const getUserJournals = useJournalStore((state) => state.getUserJournals);
  const [query, setQuery] = useState("");
  const [open, setOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const rootRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (!journals.length) {
      getUserJournals().catch(() => undefined);
    }
  }, [getUserJournals, journals.length]);

  useEffect(() => {
    const handlePointer = (event: MouseEvent) => {
      if (!rootRef.current?.contains(event.target as Node)) {
        setOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointer);
    return () => document.removeEventListener("mousedown", handlePointer);
  }, []);

  const results = useMemo(() => {
    const trimmed = query.trim().toLowerCase();
    const source = trimmed
      ? journals.filter((journal) => matchesQuery(journal, trimmed))
      : journals;
    return source.slice(0, 6);
  }, [journals, query]);

  useEffect(() => {
    setActiveIndex(0);
  }, [query, results.length]);

  const goToJournal = (journalId: string) => {
    setOpen(false);
    setQuery("");
    router.push(`/home/journal/${journalId}`);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (results[activeIndex]) {
      goToJournal(results[activeIndex]._id);
      return;
    }

    const next = query.trim();
    setOpen(false);
    router.push(
      next ? `/home/journal?q=${encodeURIComponent(next)}` : "/home/journal",
    );
  };

  return (
    <form ref={rootRef} onSubmit={handleSubmit} className="relative w-72">
      <label className="flex h-11 items-center gap-3 rounded-full border border-slate-200 bg-white px-4 text-sm text-slate-500 shadow-sm dark:border-white/10 dark:bg-white/[0.04] dark:text-slate-400">
        <Search size={17} />
        <input
          className="w-full bg-transparent text-slate-700 outline-none placeholder:text-slate-400 dark:text-white"
          placeholder="Search journals..."
          value={query}
          onChange={(event) => {
            setQuery(event.target.value);
            setOpen(true);
          }}
          onFocus={() => setOpen(true)}
          onKeyDown={(event) => {
            if (!open || !results.length) return;
            if (event.key === "ArrowDown") {
              event.preventDefault();
              setActiveIndex((current) => (current + 1) % results.length);
            }
            if (event.key === "ArrowUp") {
              event.preventDefault();
              setActiveIndex((current) =>
                current === 0 ? results.length - 1 : current - 1,
              );
            }
            if (event.key === "Escape") {
              setOpen(false);
            }
          }}
          role="combobox"
          aria-expanded={open}
          aria-controls="journal-search-results"
          autoComplete="off"
        />
      </label>

      {open ? (
        <div
          id="journal-search-results"
          role="listbox"
          className="absolute right-0 top-[calc(100%+8px)] z-50 w-[22rem] overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl shadow-slate-200/70 dark:border-white/10 dark:bg-card dark:shadow-black/40"
        >
          {results.length ? (
            <ul className="max-h-80 overflow-y-auto py-1">
              {results.map((journal, index) => {
                const isActive = index === activeIndex;
                return (
                  <li key={journal._id}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={isActive}
                      onMouseEnter={() => setActiveIndex(index)}
                      onClick={() => goToJournal(journal._id)}
                      className={`flex w-full items-start gap-3 px-3 py-2.5 text-left transition ${
                        isActive
                          ? "bg-slate-100 dark:bg-white/10"
                          : "hover:bg-slate-50 dark:hover:bg-white/[0.04]"
                      }`}
                    >
                      <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-xl bg-primary/15 text-primary">
                        <BookOpenText size={15} />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="flex items-center justify-between gap-2">
                          <span className="truncate text-sm font-bold text-slate-950 dark:text-white">
                            {formatDate(journal.journalDate)}
                          </span>
                          <span
                            className={`shrink-0 text-xs font-semibold ${pnlClass(journal.totalProfitLoss || 0)}`}
                          >
                            {formatMoney(
                              journal.totalProfitLoss || 0,
                              getRecordCurrency(journal),
                            )}
                          </span>
                        </span>
                        <span className="mt-0.5 block truncate text-xs text-slate-500 dark:text-slate-400">
                          {journalLabel(journal)}
                        </span>
                      </span>
                    </button>
                  </li>
                );
              })}
            </ul>
          ) : (
            <p className="px-4 py-6 text-center text-sm text-slate-500 dark:text-slate-400">
              {query.trim()
                ? "No journals match that search."
                : "No journals yet. Start your day to create one."}
            </p>
          )}
        </div>
      ) : null}
    </form>
  );
}
