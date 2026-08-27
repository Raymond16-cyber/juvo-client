import { animate, stagger } from "animejs";
import { cleanupAnime, getScopedElements, prefersReducedMotion } from "@/animations";

export function animateAiAnalysis(root: HTMLElement | null) {
  if (!root) return () => undefined;

  const dots = getScopedElements<HTMLElement>(root, "[data-ai-dot]");
  const insights = getScopedElements<HTMLElement>(root, "[data-ai-insight]");

  if (prefersReducedMotion()) {
    [...dots, ...insights].forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });

    return () => undefined;
  }

  const pulse = animate(dots, {
    opacity: { from: 0.25, to: 1 },
    y: { from: 0, to: -3 },
    duration: 820,
    delay: stagger(140),
    alternate: true,
    loop: true,
    ease: "inOutSine",
  });

  const reveal = animate(insights, {
    opacity: { from: 0, to: 1 },
    y: { from: 12, to: 0 },
    duration: 560,
    delay: stagger(90, { start: 240 }),
    ease: "outCubic",
  });

  return () => cleanupAnime([pulse, reveal]);
}

