"use client";

import { prefersReducedMotion } from "@/lib/motion";
import { motion, useAnimationControls } from "framer-motion";
import { useEffect, useState } from "react";

type PinataAnimationProps = {
  onBurst?: () => void;
  onComplete?: () => void;
};

/**
 * Browser-rendered piñata sequence (SVG + Framer Motion).
 * Kept independent of Lottie so celebrations still work if a Lottie asset fails.
 */
export default function PinataAnimation({
  onBurst,
  onComplete,
}: PinataAnimationProps) {
  const controls = useAnimationControls();
  const [cracked, setCracked] = useState(false);
  const [bursting, setBursting] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const burstOnce = (() => {
      let fired = false;
      return () => {
        if (fired) return;
        fired = true;
        onBurst?.();
      };
    })();

    const run = async () => {
      if (prefersReducedMotion()) {
        setCracked(true);
        setBursting(true);
        burstOnce();
        setDone(true);
        onComplete?.();
        return;
      }

      await controls.start({
        y: [90, -10, 0],
        opacity: [0, 1, 1],
        rotate: [-10, 5, 0],
        scale: [0.82, 1.06, 1],
        transition: { duration: 0.75, ease: [0.22, 1, 0.36, 1] },
      });
      if (cancelled) return;

      await controls.start({
        rotate: [0, -12, 14, -16, 12, -7, 3, 0],
        x: [0, -8, 10, -12, 8, -5, 0],
        transition: { duration: 0.9, ease: "easeInOut" },
      });
      if (cancelled) return;

      setCracked(true);
      await controls.start({
        scale: [1, 1.08, 1.03],
        transition: { duration: 0.32 },
      });
      if (cancelled) return;

      setBursting(true);
      burstOnce();
      await controls.start({
        scale: [1.03, 1.4, 0.15],
        opacity: [1, 1, 0],
        rotate: [0, -24, 28],
        transition: { duration: 0.48, ease: [0.4, 0, 0.2, 1] },
      });
      if (cancelled) return;

      setDone(true);
      onComplete?.();
    };

    void run();
    return () => {
      cancelled = true;
    };
  }, [controls, onBurst, onComplete]);

  if (done) return null;

  return (
    <div className="pointer-events-none fixed inset-0 z-[91] flex items-center justify-center">
      <div className="absolute inset-0 bg-slate-950/25 backdrop-blur-[1px]" />
      <motion.div
        animate={controls}
        initial={{ opacity: 0, y: 90, scale: 0.82 }}
        className="relative"
        aria-hidden
      >
        <PinataSvg cracked={cracked} bursting={bursting} />
        <span className="absolute -top-12 left-1/2 h-12 w-px -translate-x-1/2 bg-gradient-to-b from-transparent via-slate-400/80 to-slate-500/50" />
      </motion.div>
    </div>
  );
}

function PinataSvg({
  cracked,
  bursting,
}: {
  cracked: boolean;
  bursting: boolean;
}) {
  return (
    <svg
      width="200"
      height="210"
      viewBox="0 0 168 176"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="drop-shadow-[0_22px_48px_rgba(0,212,255,0.35)]"
    >
      <path
        d="M84 18c0-8 6-14 14-14"
        stroke="#94a3b8"
        strokeWidth="3"
        strokeLinecap="round"
      />
      <ellipse cx="84" cy="96" rx="52" ry="58" fill="url(#juvoPinataBody)" />
      <ellipse
        cx="84"
        cy="96"
        rx="52"
        ry="58"
        fill="url(#juvoPinataSheen)"
        opacity="0.55"
      />
      <path
        d="M36 78c20 10 76 10 96 0"
        stroke="#fbbf24"
        strokeWidth="5"
        strokeLinecap="round"
        opacity="0.95"
      />
      <path
        d="M34 102c22 12 78 12 100 0"
        stroke="#00D4FF"
        strokeWidth="5"
        strokeLinecap="round"
      />
      <path
        d="M38 126c20 8 72 8 92 0"
        stroke="#34d399"
        strokeWidth="4"
        strokeLinecap="round"
        opacity="0.9"
      />
      {[40, 56, 72, 88, 104, 120].map((x) => (
        <path
          key={x}
          d={`M${x} 148c2 10 4 18 0 26`}
          stroke={
            x % 32 === 0 ? "#f87171" : x % 24 === 0 ? "#a78bfa" : "#22d3ee"
          }
          strokeWidth="3"
          strokeLinecap="round"
        />
      ))}
      <circle cx="68" cy="88" r="4.5" fill="#0B1220" />
      <circle cx="100" cy="88" r="4.5" fill="#0B1220" />
      <path
        d="M72 108c6 6 18 6 24 0"
        stroke="#0B1220"
        strokeWidth="3"
        strokeLinecap="round"
      />
      {cracked ? (
        <g stroke="#0B1220" strokeWidth="2.5" strokeLinecap="round" opacity="0.8">
          <path d="M84 54l-10 28 12 18" />
          <path d="M84 54l14 22-8 26" />
          <path d="M60 90l18 8" />
          <path d="M108 92l-16 10" />
        </g>
      ) : null}
      {bursting
        ? [
            [28, 68],
            [132, 64],
            [46, 132],
            [122, 134],
            [84, 46],
            [60, 50],
            [110, 52],
          ].map(([x, y], index) => (
            <circle
              key={`${x}-${y}`}
              cx={x}
              cy={y}
              r={3.5 + (index % 3)}
              fill={index % 2 ? "#fbbf24" : "#00D4FF"}
            />
          ))
        : null}
      <defs>
        <linearGradient id="juvoPinataBody" x1="40" y1="40" x2="130" y2="150">
          <stop stopColor="#0891b2" />
          <stop offset="0.45" stopColor="#00D4FF" />
          <stop offset="1" stopColor="#0B1220" />
        </linearGradient>
        <linearGradient id="juvoPinataSheen" x1="60" y1="50" x2="110" y2="120">
          <stop stopColor="#ffffff" stopOpacity="0.4" />
          <stop offset="1" stopColor="#ffffff" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
}
