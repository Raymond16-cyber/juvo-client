"use client";

import { animateAuthBricks } from "@/animations/auth";
import { useEffect, useRef } from "react";

const BRICK_SIZE = 11;
const GAP = 4;
const COLS = 5;
const ROWS = 5;

const J_CELLS = [
  [0, 1],
  [0, 2],
  [0, 3],
  [0, 4],
  [1, 4],
  [2, 4],
  [3, 0],
  [3, 4],
  [4, 1],
  [4, 2],
  [4, 3],
] as const;

const BRICK_COLORS = [
  "bg-primary",
  "bg-secondary",
  "bg-accent",
  "bg-primary",
  "bg-white/90 dark:bg-primary",
  "bg-secondary",
  "bg-accent",
  "bg-primary",
  "bg-secondary",
  "bg-white/90 dark:bg-primary",
  "bg-accent",
];

export default function AuthLoadingScreen({
  label = "Checking your session",
}: {
  label?: string;
}) {
  const rootRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    return animateAuthBricks(rootRef.current);
  }, [label]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 text-slate-950 dark:bg-background dark:text-white">
      <div ref={rootRef} className="flex flex-col items-center gap-6">
        <div
          data-auth-mark
          className="relative grid h-[5.75rem] w-[5.75rem] place-items-center rounded-[1.75rem] bg-slate-950 shadow-[0_20px_50px_rgba(0,212,255,0.18)] dark:bg-[#070b14] dark:shadow-[0_20px_50px_rgba(0,212,255,0.12)]"
        >
          <div
            className="relative"
            style={{
              width: COLS * BRICK_SIZE + (COLS - 1) * GAP,
              height: ROWS * BRICK_SIZE + (ROWS - 1) * GAP,
            }}
          >
            {J_CELLS.map(([row, col], index) => (
              <span
                key={`${row}-${col}`}
                data-auth-brick
                className={`absolute rounded-[3px] ${BRICK_COLORS[index % BRICK_COLORS.length]}`}
                style={{
                  width: BRICK_SIZE,
                  height: BRICK_SIZE,
                  left: col * (BRICK_SIZE + GAP),
                  top: row * (BRICK_SIZE + GAP),
                }}
              />
            ))}
          </div>
        </div>
        <p
          data-auth-label
          className="text-sm font-semibold text-slate-500 dark:text-slate-400"
        >
          {label}
        </p>
      </div>
    </div>
  );
}
