type ConnectionInfo = EventTarget & { saveData?: boolean };

export function connectAuthVideo(video: HTMLVideoElement, source: string) {
  const desktop = window.matchMedia("(min-width: 1024px)");
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const connection = (navigator as Navigator & { connection?: ConnectionInfo }).connection;
  let disposed = false;
  let failed = false;
  let attempt = 0;

  const eligible = () => desktop.matches && !reducedMotion.matches && !connection?.saveData;
  const unload = () => {
    video.style.opacity = "0";
    video.pause();
    if (video.hasAttribute("src")) {
      video.removeAttribute("src");
      video.load();
    }
  };
  const fail = () => {
    if (disposed) return;
    failed = true;
    attempt++;
    unload();
  };
  const update = () => {
    const currentAttempt = ++attempt;
    if (disposed || failed || !eligible()) {
      unload();
      return;
    }
    if (document.visibilityState === "hidden") {
      video.pause();
      return;
    }
    if (video.getAttribute("src") !== source) video.setAttribute("src", source);
    video.muted = true;
    void video.play().catch(() => {
      // Ignore aborted play requests from an earlier visibility or media-query state.
      if (!disposed && currentAttempt === attempt) fail();
    });
  };
  const reveal = () => {
    if (!disposed && !failed && eligible() && document.visibilityState !== "hidden") {
      video.style.opacity = "1";
    }
  };

  desktop.addEventListener("change", update);
  reducedMotion.addEventListener("change", update);
  connection?.addEventListener("change", update);
  document.addEventListener("visibilitychange", update);
  video.addEventListener("playing", reveal);
  video.addEventListener("error", fail);
  update();

  return () => {
    disposed = true;
    attempt++;
    desktop.removeEventListener("change", update);
    reducedMotion.removeEventListener("change", update);
    connection?.removeEventListener("change", update);
    document.removeEventListener("visibilitychange", update);
    video.removeEventListener("playing", reveal);
    video.removeEventListener("error", fail);
    unload();
  };
}
