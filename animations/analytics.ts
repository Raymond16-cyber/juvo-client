import { animate, stagger } from "animejs";
import { cleanupAnime, getScopedElements, prefersReducedMotion } from "@/animations";

export function animateProgressGroup(root: HTMLElement | null) {
  if (!root) return () => undefined;

  const items = getScopedElements<HTMLElement>(root, "[data-progress-item]");
  const bars = getScopedElements<HTMLElement>(root, "[data-progress-bar]");

  if (prefersReducedMotion()) {
    items.forEach((item) => {
      item.style.opacity = "1";
      item.style.transform = "none";
    });
    bars.forEach((bar) => {
      bar.style.transform = "scaleX(1)";
    });

    return () => undefined;
  }

  const reveal = animate(items, {
    opacity: { from: 0, to: 1 },
    y: { from: 12, to: 0 },
    duration: 520,
    delay: stagger(70),
    ease: "outCubic",
  });

  const fill = animate(bars, {
    scaleX: { from: 0, to: 1 },
    duration: 720,
    delay: stagger(80, { start: 140 }),
    ease: "outCubic",
  });

  return () => cleanupAnime([reveal, fill]);
}

export function animateInsightCards(root: HTMLElement | null) {
  if (!root) return () => undefined;

  const cards = getScopedElements<HTMLElement>(root, "[data-insight-card]");

  if (prefersReducedMotion()) {
    cards.forEach((card) => {
      card.style.opacity = "1";
      card.style.transform = "none";
    });

    return () => undefined;
  }

  const animation = animate(cards, {
    opacity: { from: 0, to: 1 },
    y: { from: 12, to: 0 },
    duration: 560,
    delay: stagger(75),
    ease: "outCubic",
  });

  return () => cleanupAnime([animation]);
}

