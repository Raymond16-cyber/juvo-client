export type AnimeCleanup = {
  revert?: () => unknown;
  cancel?: () => unknown;
  pause?: () => unknown;
};

export function prefersReducedMotion() {
  if (typeof window === "undefined") return true;

  return window.matchMedia("(prefers-reduced-motion: reduce)").matches;
}

export function cleanupAnime(items: Array<AnimeCleanup | null | undefined>) {
  items.forEach((item) => {
    if (!item) return;
    if (typeof item.revert === "function") {
      item.revert();
      return;
    }
    if (typeof item.cancel === "function") {
      item.cancel();
      return;
    }
    item.pause?.();
  });
}

export function getScopedElements<T extends Element>(
  root: Element | null,
  selector: string,
) {
  return root ? Array.from(root.querySelectorAll<T>(selector)) : [];
}

