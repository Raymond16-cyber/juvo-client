"use client";

import AchievementModal from "@/components/celebrations/AchievementModal";
import AchievementTitleReveal from "@/components/celebrations/AchievementTitleReveal";
import ConfettiCanvas from "@/components/celebrations/ConfettiCanvas";
import PinataAnimation from "@/components/celebrations/PinataAnimation";
import { prefersReducedMotion } from "@/lib/motion";
import { useCelebrationStore } from "@/stores/celebration.store";
import { useCallback, useEffect, useRef, useState } from "react";

type Stage = "idle" | "pinata" | "fiesta" | "modal";

/**
 * Global host for achievement celebrations.
 * Sequence: piñata → confetti + curved title reveal → achievement modal.
 */
export default function CelebrationHost() {
  const active = useCelebrationStore((state) => state.active);
  const dismissActive = useCelebrationStore((state) => state.dismissActive);
  const [stage, setStage] = useState<Stage>("idle");
  const [showTitle, setShowTitle] = useState(false);
  const activeId = active?.achievement.id ?? null;
  const burstLock = useRef(false);
  const titleDelayRef = useRef<number | null>(null);

  useEffect(() => {
    burstLock.current = false;
    setShowTitle(false);
    if (titleDelayRef.current) {
      window.clearTimeout(titleDelayRef.current);
      titleDelayRef.current = null;
    }

    if (!active) {
      setStage("idle");
      return;
    }

    if (prefersReducedMotion()) {
      setStage("fiesta");
      setShowTitle(true);
      return;
    }

    if (active.intensity === "grand" || active.intensity === "medium") {
      setStage("pinata");
      return;
    }

    // Small unlocks skip piñata but still get confetti + title.
    setStage("fiesta");
    titleDelayRef.current = window.setTimeout(() => setShowTitle(true), 180);
  }, [active, activeId]);

  useEffect(() => {
    return () => {
      if (titleDelayRef.current) {
        window.clearTimeout(titleDelayRef.current);
      }
    };
  }, []);

  // Fail-open timeouts per stage.
  useEffect(() => {
    if (!active || stage === "idle" || stage === "modal") return;
    const ms = stage === "pinata" ? 4500 : 6500;
    const timer = window.setTimeout(() => {
      if (stage === "pinata") {
        setStage("fiesta");
        setShowTitle(true);
        return;
      }
      setStage("modal");
    }, ms);
    return () => window.clearTimeout(timer);
  }, [active, stage]);

  const startFiesta = useCallback(() => {
    setStage("fiesta");
    if (titleDelayRef.current) window.clearTimeout(titleDelayRef.current);
    // Title emerges just after the confetti bloom starts.
    titleDelayRef.current = window.setTimeout(() => setShowTitle(true), 220);
  }, []);

  const handleBurst = useCallback(() => {
    if (burstLock.current) return;
    burstLock.current = true;
    startFiesta();
  }, [startFiesta]);

  const handleTitleComplete = useCallback(() => {
    setStage("modal");
    setShowTitle(false);
  }, []);

  const handleClose = useCallback(() => {
    dismissActive();
  }, [dismissActive]);

  if (!active) return null;

  const title =
    active.achievement.title?.trim() || "Achievement unlocked";

  return (
    <>
      {stage === "pinata" ? (
        <PinataAnimation key={`pinata-${activeId}`} onBurst={handleBurst} />
      ) : null}

      {stage === "fiesta" ? (
        <>
          <ConfettiCanvas
            key={`confetti-${activeId}-${active.intensity}`}
            intensity={active.intensity}
            active
          />
          {showTitle ? (
            <AchievementTitleReveal
              key={`title-${activeId}`}
              title={title}
              intensity={active.intensity}
              onComplete={handleTitleComplete}
            />
          ) : null}
        </>
      ) : null}

      <AchievementModal
        achievement={active.achievement}
        open={stage === "modal"}
        onClose={handleClose}
      />
    </>
  );
}
