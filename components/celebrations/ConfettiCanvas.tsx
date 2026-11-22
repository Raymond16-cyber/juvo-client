"use client";

import {
  CELEBRATION_COLORS,
  type CelebrationIntensity,
} from "@/lib/celebrations/intensity";
import { prefersReducedMotion } from "@/lib/motion";
import confetti from "canvas-confetti";
import { useEffect, useRef } from "react";

type ConfettiCanvasProps = {
  intensity: CelebrationIntensity;
  /** Fires once after the primary burst sequence finishes scheduling. */
  onComplete?: () => void;
  active?: boolean;
};

function fireBurst(
  instance: ReturnType<typeof confetti.create>,
  intensity: CelebrationIntensity,
) {
  const colors = [...CELEBRATION_COLORS[intensity]];
  const reduced = prefersReducedMotion();

  if (reduced) {
    instance({
      particleCount: intensity === "small" ? 18 : 28,
      spread: 55,
      origin: { y: 0.55 },
      colors,
      ticks: 120,
      scalar: 0.8,
      zIndex: 90,
    });
    return 450;
  }

  if (intensity === "small") {
    instance({
      particleCount: 42,
      spread: 58,
      startVelocity: 28,
      origin: { y: 0.62, x: 0.5 },
      colors,
      shapes: ["circle", "square"],
      scalar: 0.85,
      zIndex: 90,
    });
    return 900;
  }

  if (intensity === "medium") {
    instance({
      particleCount: 70,
      angle: 60,
      spread: 62,
      origin: { x: 0.2, y: 0.7 },
      colors,
      shapes: ["square", "circle", "star"],
      zIndex: 90,
    });
    instance({
      particleCount: 70,
      angle: 120,
      spread: 62,
      origin: { x: 0.8, y: 0.7 },
      colors,
      shapes: ["square", "circle", "star"],
      zIndex: 90,
    });
    window.setTimeout(() => {
      instance({
        particleCount: 50,
        spread: 90,
        origin: { y: 0.45 },
        colors,
        shapes: ["star", "circle"],
        scalar: 1,
        zIndex: 90,
      });
    }, 220);
    return 1600;
  }

  const end = Date.now() + 1400;
  const frame = () => {
    instance({
      particleCount: 6,
      angle: 60,
      spread: 55,
      origin: { x: 0.15, y: 0.55 },
      colors,
      shapes: ["square", "circle", "star"],
      startVelocity: 42,
      zIndex: 90,
    });
    instance({
      particleCount: 6,
      angle: 120,
      spread: 55,
      origin: { x: 0.85, y: 0.55 },
      colors,
      shapes: ["square", "circle", "star"],
      startVelocity: 42,
      zIndex: 90,
    });
    if (Date.now() < end) {
      window.requestAnimationFrame(frame);
    }
  };
  frame();
  window.setTimeout(() => {
    instance({
      particleCount: 120,
      spread: 100,
      startVelocity: 48,
      origin: { y: 0.48, x: 0.5 },
      colors,
      shapes: ["star", "circle", "square"],
      scalar: 1.05,
      zIndex: 90,
    });
  }, 180);
  return 2200;
}

export default function ConfettiCanvas({
  intensity,
  onComplete,
  active = true,
}: ConfettiCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!active) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    const instance = confetti.create(canvas, {
      resize: true,
      useWorker: true,
    });

    const duration = fireBurst(instance, intensity);
    const timer = window.setTimeout(() => {
      onComplete?.();
    }, duration);

    return () => {
      window.clearTimeout(timer);
      instance.reset();
    };
  }, [active, intensity, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      aria-hidden
      className="pointer-events-none fixed inset-0 z-[90] h-full w-full"
    />
  );
}
