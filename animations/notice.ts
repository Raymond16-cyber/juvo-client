import { animate, createTimeline, stagger } from "animejs";
import { cleanupAnime, prefersReducedMotion } from "@/animations";

export function animateNoticeIn(root: HTMLElement | null) {
  if (!root) return () => undefined;

  const card = root.querySelector<HTMLElement>("[data-notice-card]") || root;

  const glow = root.querySelector<HTMLElement>("[data-notice-glow]");
  const icon = root.querySelector<HTMLElement>("[data-notice-icon]");
  const copy = root.querySelectorAll<HTMLElement>("[data-notice-copy]");

  if (prefersReducedMotion()) {
    [card, glow, icon, ...copy].forEach((element) => {
      if (!element) return;
      element.style.opacity = "1";
      element.style.transform = "none";
    });
    return () => undefined;
  }

  const timeline = createTimeline({
    defaults: {
      ease: "outCubic",
    },
  });

  timeline.add(card, {
    opacity: { from: 0, to: 1 },
    y: { from: 28, to: 0 },
    scale: { from: 0.92, to: 1 },
    duration: 520,
  });

  if (glow) {
    timeline.add(
      glow,
      {
        opacity: { from: 0, to: 0.9 },
        scale: { from: 0.6, to: 1 },
        duration: 700,
      },
      "<<",
    );
  }

  if (icon) {
    timeline.add(
      icon,
      {
        opacity: { from: 0, to: 1 },
        scale: { from: 0.6, to: 1 },
        rotate: { from: -12, to: 0 },
        duration: 420,
      },
      "<<+=120",
    );
  }

  if (copy.length) {
    timeline.add(
      copy,
      {
        opacity: { from: 0, to: 1 },
        y: { from: 10, to: 0 },
        duration: 360,
        delay: stagger(70),
      },
      "<<+=80",
    );
  }

  return () => cleanupAnime([timeline]);
}

export function animateNoticeOut(root: HTMLElement | null) {
  if (!root) return Promise.resolve();

  const card = root.querySelector<HTMLElement>("[data-notice-card]") || root;

  if (prefersReducedMotion()) {
    root.style.opacity = "0";
    return Promise.resolve();
  }

  return new Promise<void>((resolve) => {
    const animation = animate(card, {
      opacity: { from: 1, to: 0 },
      y: { from: 0, to: -18 },
      scale: { from: 1, to: 0.96 },
      duration: 280,
      ease: "inCubic",
      onComplete: () => resolve(),
    });

    window.setTimeout(() => {
      cleanupAnime([animation]);
      resolve();
    }, 360);
  });
}
