import { animate, createTimeline, stagger } from "animejs";
import { cleanupAnime, getScopedElements, prefersReducedMotion } from "@/animations";

export function animateAuthBricks(root: HTMLElement | null) {
  if (!root) return () => undefined;

  const bricks = getScopedElements<HTMLElement>(root, "[data-auth-brick]");
  const mark = root.querySelector<HTMLElement>("[data-auth-mark]");
  const label = root.querySelector<HTMLElement>("[data-auth-label]");

  if (prefersReducedMotion()) {
    [...bricks, mark, label].forEach((element) => {
      if (!element) return;
      element.style.opacity = "1";
      element.style.transform = "none";
    });
    return () => undefined;
  }

  const scatter = bricks.map((_, index) => {
    const angle = (index / Math.max(bricks.length, 1)) * Math.PI * 2;
    const distance = 28 + (index % 4) * 14;
    return {
      x: Math.cos(angle) * distance,
      y: Math.sin(angle) * distance,
      rotate: index % 2 === 0 ? -28 : 32,
    };
  });

  const timeline = createTimeline({
    loop: true,
    defaults: {
      ease: "inOutCubic",
    },
  });

  timeline.add(
    bricks,
    {
      x: (_, index) => scatter[index].x,
      y: (_, index) => scatter[index].y,
      rotate: (_, index) => scatter[index].rotate,
      opacity: 0.4,
      duration: 680,
      delay: stagger(32),
    },
    1000,
  );

  timeline.add(
    bricks,
    {
      x: 0,
      y: 0,
      rotate: 0,
      opacity: 1,
      duration: 780,
      delay: stagger(32),
      ease: "outBack",
    },
    "+=260",
  );

  const markPulse = mark
    ? animate(mark, {
        scale: [1, 1.04, 1],
        duration: 2200,
        ease: "inOutSine",
        loop: true,
      })
    : null;

  const labelPulse = label
    ? animate(label, {
        opacity: [0.45, 1],
        duration: 1100,
        ease: "inOutSine",
        alternate: true,
        loop: true,
      })
    : null;

  return () => cleanupAnime([timeline, markPulse, labelPulse]);
}
