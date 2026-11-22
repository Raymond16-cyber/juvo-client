"use client";

import { cn } from "@/lib/ui";
import { GripVertical } from "lucide-react";
import { useState } from "react";

type SortableListProps<T> = {
  items: T[];
  getKey: (item: T) => string;
  onReorder: (next: T[]) => void;
  renderItem: (item: T, index: number) => React.ReactNode;
  className?: string;
  itemClassName?: string;
};

/** Lightweight HTML5 drag-and-drop reorder for short organization lists. */
export default function SortableList<T>({
  items,
  getKey,
  onReorder,
  renderItem,
  className,
  itemClassName,
}: SortableListProps<T>) {
  const [dragIndex, setDragIndex] = useState<number | null>(null);
  const [overIndex, setOverIndex] = useState<number | null>(null);

  const move = (from: number, to: number) => {
    if (from === to || from < 0 || to < 0 || from >= items.length || to >= items.length) {
      return;
    }
    const next = items.slice();
    const [removed] = next.splice(from, 1);
    next.splice(to, 0, removed);
    onReorder(next);
  };

  return (
    <ul className={cn("space-y-2", className)}>
      {items.map((item, index) => {
        const key = getKey(item);
        return (
          <li
            key={key}
            draggable
            onDragStart={() => setDragIndex(index)}
            onDragOver={(event) => {
              event.preventDefault();
              setOverIndex(index);
            }}
            onDrop={(event) => {
              event.preventDefault();
              if (dragIndex == null) return;
              move(dragIndex, index);
              setDragIndex(null);
              setOverIndex(null);
            }}
            onDragEnd={() => {
              setDragIndex(null);
              setOverIndex(null);
            }}
            className={cn(
              "flex items-stretch gap-2 rounded-control border border-border bg-card transition",
              overIndex === index && dragIndex !== index && "border-primary/50",
              dragIndex === index && "opacity-60",
              itemClassName,
            )}
          >
            <button
              type="button"
              aria-label={`Reorder item ${index + 1}`}
              className="grid w-9 shrink-0 cursor-grab place-items-center text-slate-400 active:cursor-grabbing"
            >
              <GripVertical size={16} />
            </button>
            <div className="min-w-0 flex-1 py-2 pr-3">{renderItem(item, index)}</div>
          </li>
        );
      })}
    </ul>
  );
}
