"use client";

import { cn } from "@/lib/ui";
import { prefersReducedMotion } from "@/lib/motion";
import { Lottie, type LottieHandle } from "lottie-react";
import { useEffect, useMemo, useRef } from "react";

type LottiePlayerProps = {
  /** Path, URL, or parsed Lottie JSON object. */
  src: string | object;
  className?: string;
  loop?: boolean;
  autoplay?: boolean;
  /** Marker name that should fire `onBurst` (from the Lottie file). */
  burstMarker?: string;
  /** Fallback progress (0–1) if markers are unavailable. */
  burstAt?: number;
  onBurst?: () => void;
  onComplete?: () => void;
  onError?: () => void;
};

/** Reusable Lottie host for celebration and other motion accents. */
export default function LottiePlayer({
  src,
  className,
  loop = false,
  autoplay = true,
  burstMarker = "burst",
  burstAt = 0.66,
  onBurst,
  onComplete,
  onError,
}: LottiePlayerProps) {
  const lottieRef = useRef<LottieHandle>(null);
  const burstFired = useRef(false);
  const reduced = prefersReducedMotion();

  useEffect(() => {
    burstFired.current = false;
  }, [src]);

  useEffect(() => {
    if (!reduced) return;
    onBurst?.();
    const timer = window.setTimeout(() => onComplete?.(), 160);
    return () => window.clearTimeout(timer);
  }, [reduced, onBurst, onComplete]);

  const subscriptions = useMemo(
    () => ({
      complete: () => {
        onComplete?.();
      },
      marker: (event: { marker: string }) => {
        if (burstFired.current) return;
        if (event.marker === burstMarker) {
          burstFired.current = true;
          onBurst?.();
        }
      },
      frame: (event: { currentFrame: number }) => {
        if (burstFired.current || !onBurst) return;
        const frames = Number(
          lottieRef.current?.animationItem?.totalFrames || 0,
        );
        if (frames > 0 && event.currentFrame / frames >= burstAt) {
          burstFired.current = true;
          onBurst();
        }
      },
      error: () => {
        onError?.();
      },
    }),
    [burstAt, burstMarker, onBurst, onComplete, onError],
  );

  return (
    <Lottie
      src={src}
      lottieRef={lottieRef}
      autoplay={reduced ? false : autoplay}
      loop={loop}
      className={cn("pointer-events-none", className)}
      aria-hidden
      subscriptions={subscriptions}
    />
  );
}
