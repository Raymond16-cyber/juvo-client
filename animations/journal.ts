import { animate, createTimeline, stagger } from "animejs";
import { cleanupAnime, getScopedElements, prefersReducedMotion } from "@/animations";

export function animateJournalSequence(root: HTMLElement | null) {
  if (!root) return () => undefined;

  const prompts = getScopedElements<HTMLElement>(root, "[data-journal-prompt]");
  const body = getScopedElements<HTMLElement>(root, "[data-journal-body]");

  if (prefersReducedMotion()) {
    [...prompts, ...body].forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });

    return () => undefined;
  }

  const timeline = createTimeline({
    defaults: {
      duration: 520,
      ease: "outCubic",
    },
  });

  timeline
    .add(prompts, {
      opacity: { from: 0, to: 1 },
      y: { from: 15, to: 0 },
      delay: stagger(180),
    })
    .add(
      body,
      {
        opacity: { from: 0, to: 1 },
        y: { from: 12, to: 0 },
        delay: stagger(55),
      },
      "-=120",
    );

  return () => cleanupAnime([timeline]);
}

export function animateJournalStateChange(root: HTMLElement | null) {
  if (!root || prefersReducedMotion()) return () => undefined;

  const statePanel = getScopedElements<HTMLElement>(root, "[data-journal-state]");
  const animation = animate(statePanel, {
    opacity: { from: 0, to: 1 },
    y: { from: 10, to: 0 },
    duration: 420,
    ease: "outCubic",
  });

  return () => cleanupAnime([animation]);
}
