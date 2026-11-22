"use client";

import { interactionTransition } from "@/lib/motion";
import { cn } from "@/lib/ui";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

const DEFAULT_PER_PAGE = 5;

type PaginatedCollectionProps<T> = {
  items: T[];
  itemsPerPage?: number;
  renderItem: (item: T, index: number) => React.ReactNode;
  getKey?: (item: T, index: number) => string | number;
  className?: string;
  listClassName?: string;
  emptyState?: React.ReactNode;
  /** Show numbered pages when total pages is small; otherwise prev/next only. */
  showPageNumbers?: boolean;
};

export default function PaginatedCollection<T>({
  items,
  itemsPerPage = DEFAULT_PER_PAGE,
  renderItem,
  getKey,
  className,
  listClassName,
  emptyState = null,
  showPageNumbers = true,
}: PaginatedCollectionProps<T>) {
  const reduceMotion = useReducedMotion();
  const perPage = Math.max(1, itemsPerPage);
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));
  const [page, setPage] = useState(1);
  const [direction, setDirection] = useState(0);

  useEffect(() => {
    setPage((current) => Math.min(current, totalPages));
  }, [totalPages]);

  const pageItems = useMemo(() => {
    const start = (page - 1) * perPage;
    return items.slice(start, start + perPage);
  }, [items, page, perPage]);

  const goTo = (next: number) => {
    const clamped = Math.min(totalPages, Math.max(1, next));
    if (clamped === page) return;
    setDirection(clamped > page ? 1 : -1);
    setPage(clamped);
  };

  if (!items.length) {
    return <div className={className}>{emptyState}</div>;
  }

  const showControls = items.length > perPage;

  return (
    <div className={cn("min-w-0", className)}>
      <div className="relative overflow-hidden">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={page}
            custom={direction}
            initial={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, x: direction >= 0 ? 16 : -16 }
            }
            animate={{ opacity: 1, x: 0 }}
            exit={
              reduceMotion
                ? { opacity: 0 }
                : { opacity: 0, x: direction >= 0 ? -16 : 16 }
            }
            transition={interactionTransition(0.18)}
            className={listClassName}
          >
            {pageItems.map((item, index) => {
              const absoluteIndex = (page - 1) * perPage + index;
              const key = getKey
                ? getKey(item, absoluteIndex)
                : absoluteIndex;
              return (
                <div key={key}>{renderItem(item, absoluteIndex)}</div>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>

      {showControls ? (
        <nav
          className="mt-4 flex items-center justify-center gap-2"
          aria-label="Collection pagination"
        >
          <button
            type="button"
            onClick={() => goTo(page - 1)}
            disabled={page <= 1}
            aria-label="Previous page"
            className="grid h-9 w-9 place-items-center rounded-control border border-border text-slate-600 transition enabled:hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:enabled:hover:bg-white/10"
          >
            <ChevronLeft size={16} />
          </button>

          {showPageNumbers && totalPages <= 7
            ? Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (pageNumber) => (
                  <button
                    key={pageNumber}
                    type="button"
                    onClick={() => goTo(pageNumber)}
                    aria-label={`Page ${pageNumber}`}
                    aria-current={pageNumber === page ? "page" : undefined}
                    className={cn(
                      "grid h-9 min-w-9 place-items-center rounded-control px-2 text-sm font-semibold transition",
                      pageNumber === page
                        ? "bg-slate-950 text-white dark:bg-primary dark:text-slate-950"
                        : "border border-border text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-white/10",
                    )}
                  >
                    {pageNumber}
                  </button>
                ),
              )
            : (
              <span className="px-2 text-sm font-medium text-slate-500 dark:text-slate-400">
                {page} / {totalPages}
              </span>
            )}

          <button
            type="button"
            onClick={() => goTo(page + 1)}
            disabled={page >= totalPages}
            aria-label="Next page"
            className="grid h-9 w-9 place-items-center rounded-control border border-border text-slate-600 transition enabled:hover:bg-slate-100 disabled:opacity-40 dark:text-slate-300 dark:enabled:hover:bg-white/10"
          >
            <ChevronRight size={16} />
          </button>
        </nav>
      ) : null}
    </div>
  );
}
