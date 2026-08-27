import { animate, createTimeline, stagger } from "animejs";
import { cleanupAnime, getScopedElements, prefersReducedMotion } from "@/animations";

export function animateDashboardEntrance(root: HTMLElement | null) {
  if (!root) return () => undefined;

  const container = root.matches("[data-dashboard-main]")
    ? [root]
    : getScopedElements<HTMLElement>(root, "[data-dashboard-main]");
  const cards = getScopedElements<HTMLElement>(root, "[data-dashboard-card]");
  const ticker = getScopedElements<HTMLElement>(root, "[data-dashboard-ticker]");

  if (prefersReducedMotion()) {
    [...container, ...cards].forEach((element) => {
      element.style.opacity = "1";
      element.style.transform = "none";
    });

    return () => undefined;
  }

  const timeline = createTimeline({
    defaults: {
      duration: 560,
      ease: "outCubic",
    },
  });

  timeline
    .add(container, {
      opacity: { from: 0, to: 1 },
      y: { from: 10, to: 0 },
    })
    .add(
      cards,
      {
        opacity: { from: 0, to: 1 },
        y: { from: 16, to: 0 },
        delay: stagger(55),
      },
      "<<+=80",
    );

  const tickerAnimation = ticker.length
    ? animate(ticker, {
        x: "-50%",
        duration: 24000,
        ease: "linear",
        loop: true,
      })
    : null;

  return () => cleanupAnime([timeline, tickerAnimation]);
}
