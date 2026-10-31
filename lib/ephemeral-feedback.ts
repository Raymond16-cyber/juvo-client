const DEFAULT_FEEDBACK_MS = 4000;

type FeedbackClearer = () => void;

/**
 * Schedules clearing of Zustand success/error banners so they do not stick
 * across routes or linger forever on the same page.
 */
export function createEphemeralFeedback(clear: FeedbackClearer, ms = DEFAULT_FEEDBACK_MS) {
  let timer: number | null = null;

  return {
    schedule() {
      if (typeof window === "undefined") return;
      if (timer !== null) window.clearTimeout(timer);
      timer = window.setTimeout(() => {
        timer = null;
        clear();
      }, ms);
    },
    cancel() {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
    },
    clearNow() {
      this.cancel();
      clear();
    },
  };
}
