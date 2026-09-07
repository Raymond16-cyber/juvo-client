import { animate } from "animejs";
import { cleanupAnime, prefersReducedMotion } from "@/animations";

type CounterOptions = {
  value: number;
  fromValue?: number;
  formatter?: (value: number) => string;
  duration?: number;
};

export function animateCounter(
  element: HTMLElement | null,
  {
    value,
    fromValue = 0,
    formatter = (next) => String(Math.round(next)),
    duration = 900,
  }: CounterOptions,
) {
  if (!element) return () => undefined;

  if (prefersReducedMotion()) {
    element.textContent = formatter(value);
    return () => undefined;
  }

  const state = { value: fromValue };
  const animation = animate(state, {
    value,
    duration,
    ease: "outCubic",
    onUpdate: () => {
      element.textContent = formatter(state.value);
    },
    onComplete: () => {
      element.textContent = formatter(value);
    },
  });

  return () => cleanupAnime([animation]);
}
