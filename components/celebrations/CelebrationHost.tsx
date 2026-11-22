"use client";

import AchievementModal from "@/components/celebrations/AchievementModal";
import ConfettiCanvas from "@/components/celebrations/ConfettiCanvas";
import PinataAnimation from "@/components/celebrations/PinataAnimation";
import { prefersReducedMotion } from "@/lib/motion";
import { useCelebrationStore } from "@/stores/celebration.store";
import { useCallback, useEffect, useRef, useState } from "react";

type Stage = "idle" | "pinata" | "confetti" | "modal";

/**
 * Global host for achievement celebrations.
 * Mount once inside the authenticated app shell.
 */
export default function CelebrationHost() {
  const active = useCelebrationStore((state) => state.active);
  const dismissActive = useCelebrationStore((state) => state.dismissActive);
  const [stage, setStage] = useState<Stage>("idle");
  const activeId = active?.achievement.id ?? null;
  const burstLock = useRef(false);

  useEffect(() => {
    burstLock.current = false;
    if (!active) {
      setStage("idle");
      return;
    }

    if (prefersReducedMotion()) {
      setStage("confetti");
      return;
    }

    // Grand = full piñata. Medium also gets a short piñata beat for impact.
    if (active.intensity === "grand" || active.intensity === "medium") {
      setStage("pinata");
      return;
    }

    setStage("confetti");
  }, [active, activeId]);

  // Fail-open so a stuck animation never blocks the modal forever.
  useEffect(() => {
    if (!active || stage === "idle" || stage === "modal") return;
    const ms = stage === "pinata" ? 4500 : 3500;
    const timer = window.setTimeout(() => {
      if (stage === "pinata") {
        setStage("confetti");
        return;
      }
      setStage("modal");
    }, ms);
    return () => window.clearTimeout(timer);
  }, [active, stage]);

  const handleBurst = useCallback(() => {
    if (burstLock.current) return;
    burstLock.current = true;
    setStage("confetti");
  }, []);

  const handleConfettiSettled = useCallback(() => {
    setStage("modal");
  }, []);

  const handleClose = useCallback(() => {
    dismissActive();
  }, [dismissActive]);

  if (!active) return null;

  return (
    <>
      {stage === "pinata" ? (
        <PinataAnimation key={`pinata-${activeId}`} onBurst={handleBurst} />
      ) : null}

      {stage === "confetti" ? (
        <ConfettiCanvas
          key={`confetti-${activeId}-${active.intensity}`}
          intensity={active.intensity}
          active
          onComplete={handleConfettiSettled}
        />
      ) : null}

      <AchievementModal
        achievement={active.achievement}
        open={stage === "modal"}
        onClose={handleClose}
      />
    </>
  );
}
