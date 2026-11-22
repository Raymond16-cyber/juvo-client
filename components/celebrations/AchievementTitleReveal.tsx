"use client";

import { prefersReducedMotion } from "@/lib/motion";
import { motion } from "framer-motion";
import { useEffect, useMemo, useRef, useState } from "react";

type AchievementTitleRevealProps = {
  title: string;
  intensity?: "small" | "medium" | "grand";
  onComplete?: () => void;
};

type LetterPose = {
  char: string;
  x: number;
  y: number;
  rotate: number;
  key: string;
  isCenter: boolean;
};

function measureLayout(title: string, width: number) {
  const chars = Array.from(title.trim() || "Achievement");
  const len = Math.max(chars.length, 1);
  const short = len <= 12;
  const medium = len <= 22;

  const base = width < 420 ? 30 : width < 768 ? 42 : width < 1100 ? 58 : 72;
  const fontSize = Math.max(
    22,
    Math.min(base, Math.floor((width * 0.82) / (len * 0.64))),
  );

  const arcDegrees = short ? 50 : medium ? 64 : Math.min(82, 36 + len * 1.7);
  const radius = Math.max(
    fontSize * 3.4,
    Math.min(width * 0.44, fontSize * (short ? 4.8 : medium ? 5.6 : 6.4)),
  );

  const start = -arcDegrees / 2;
  const step = len <= 1 ? 0 : arcDegrees / (len - 1);
  const centerIndex = Math.floor((len - 1) / 2);

  const letters: LetterPose[] = chars.map((char, index) => {
    const deg = start + step * index;
    const rad = (deg * Math.PI) / 180;
    return {
      char: char === " " ? "\u00A0" : char,
      x: Math.sin(rad) * radius,
      // y grows downward: centre rises, edges drop → upward arch.
      y: radius * (1 - Math.cos(rad)),
      rotate: deg,
      key: `${index}-${char}`,
      isCenter: index === centerIndex,
    };
  });

  return { letters, fontSize, radius };
}

/**
 * Cinematic curved title reveal after the piñata / confetti burst.
 * Each glyph is placed on a calculated arc and scales outward from centre.
 */
export default function AchievementTitleReveal({
  title,
  intensity = "grand",
  onComplete,
}: AchievementTitleRevealProps) {
  const [viewport, setViewport] = useState({ w: 960, h: 720 });
  const completed = useRef(false);
  const reduced = prefersReducedMotion();
  const displayTitle = title.trim() || "Achievement unlocked";

  useEffect(() => {
    const update = () =>
      setViewport({ w: window.innerWidth, h: window.innerHeight });
    update();
    window.addEventListener("resize", update);
    return () => window.removeEventListener("resize", update);
  }, []);

  const layout = useMemo(
    () => measureLayout(displayTitle, viewport.w),
    [displayTitle, viewport.w],
  );

  const holdMs =
    intensity === "grand" ? 1500 : intensity === "medium" ? 1200 : 850;
  const scalePeak =
    intensity === "grand" ? 1.14 : intensity === "medium" ? 1.09 : 1.05;

  const finish = () => {
    if (completed.current) return;
    completed.current = true;
    onComplete?.();
  };

  useEffect(() => {
    completed.current = false;
  }, [displayTitle]);

  useEffect(() => {
    // Absolute safety timeout so the modal always appears.
    const timer = window.setTimeout(finish, reduced ? 1000 : 4200);
    return () => window.clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [displayTitle, reduced]);

  if (reduced) {
    return (
      <div className="pointer-events-none fixed inset-0 z-[93] flex items-center justify-center px-6">
        <motion.p
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.35 }}
          onAnimationComplete={() => {
            window.setTimeout(finish, 700);
          }}
          className="max-w-3xl text-center text-3xl font-bold tracking-tight text-white sm:text-5xl"
          style={{
            textShadow:
              "0 0 28px rgba(0,212,255,0.45), 0 8px 28px rgba(0,0,0,0.45)",
          }}
        >
          {displayTitle}
        </motion.p>
      </div>
    );
  }

  return (
    <div className="pointer-events-none fixed inset-0 z-[93] flex items-center justify-center overflow-hidden">
      <motion.div
        className="absolute inset-0"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.3 }}
        style={{
          background:
            "radial-gradient(circle at 50% 48%, rgba(0,212,255,0.24), transparent 40%), radial-gradient(circle at 50% 56%, rgba(251,191,36,0.14), transparent 52%)",
        }}
      />

      <motion.div
        className="relative"
        style={{
          width: Math.min(viewport.w * 0.96, layout.radius * 2.55),
          height: layout.radius * 1.25 + layout.fontSize * 1.6,
        }}
        initial={{ scale: 0.1, opacity: 0 }}
        animate={{
          scale: [0.1, scalePeak, 1],
          opacity: [0, 1, 1],
        }}
        transition={{
          duration: 1.2,
          times: [0, 0.58, 1],
          ease: [0.16, 1, 0.3, 1],
        }}
        onAnimationComplete={() => {
          window.setTimeout(finish, holdMs);
        }}
      >
        <h2 className="sr-only">{displayTitle}</h2>
        <div className="absolute inset-0">
          {layout.letters.map((letter, index) => (
            <motion.span
              key={letter.key}
              aria-hidden
              className="absolute font-bold uppercase select-none"
              style={{
                fontSize: layout.fontSize,
                left: "50%",
                top: "42%",
                color: letter.isCenter ? "#FDE68A" : "#F8FAFC",
                textShadow: [
                  "0 0 22px rgba(0,212,255,0.65)",
                  "0 0 48px rgba(0,212,255,0.28)",
                  "0 2px 0 rgba(251,191,36,0.45)",
                  "0 14px 32px rgba(5,8,22,0.65)",
                ].join(", "),
                WebkitTextStroke: letter.isCenter
                  ? "0.6px rgba(251,191,36,0.35)"
                  : "0.45px rgba(0,212,255,0.28)",
              }}
              initial={{
                opacity: 0,
                x: "-50%",
                y: "-50%",
                rotate: 0,
                scale: 0.12,
              }}
              animate={{
                opacity: 1,
                x: `calc(-50% + ${letter.x}px)`,
                y: `calc(-50% + ${letter.y}px)`,
                rotate: letter.rotate,
                scale: 1,
              }}
              transition={{
                duration: 1.08,
                delay: 0.05 + index * 0.032,
                ease: [0.16, 1, 0.3, 1],
              }}
            >
              {letter.char}
            </motion.span>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
