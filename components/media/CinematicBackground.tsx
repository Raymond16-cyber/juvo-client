"use client";

import {
  cinematicVideos,
  type CinematicVideoId,
} from "@/constants/cinematic-videos";
import { cn } from "@/lib/ui";
import { useEffect, useRef, useState } from "react";

type OverlayTone = "hero" | "section" | "soft";

type CinematicBackgroundProps = {
  videoId: CinematicVideoId;
  className?: string;
  /** Extra classes on the gradient/scrim stack */
  overlayClassName?: string;
  overlay?: OverlayTone;
  /** Eager load for above-the-fold hero */
  priority?: boolean;
  /** object-position override */
  objectPosition?: string;
};

type ConnectionInfo = EventTarget & { saveData?: boolean };

const overlayByTone: Record<OverlayTone, string> = {
  hero: [
    "bg-[linear-gradient(90deg,rgba(5,8,22,0.92)_0%,rgba(5,8,22,0.78)_42%,rgba(5,8,22,0.55)_68%,rgba(5,8,22,0.72)_100%)]",
    "bg-[linear-gradient(180deg,rgba(5,8,22,0.55)_0%,rgba(5,8,22,0.25)_40%,rgba(5,8,22,0.7)_100%)]",
    "bg-[radial-gradient(ellipse_at_top_right,rgba(0,212,255,0.12),transparent_45%)]",
  ].join(" "),
  section: [
    "bg-[linear-gradient(180deg,rgba(5,8,22,0.88)_0%,rgba(5,8,22,0.72)_45%,rgba(5,8,22,0.9)_100%)]",
    "bg-[radial-gradient(ellipse_at_center,rgba(0,212,255,0.08),transparent_55%)]",
  ].join(" "),
  soft: [
    "bg-[linear-gradient(180deg,rgba(5,8,22,0.7)_0%,rgba(5,8,22,0.55)_50%,rgba(5,8,22,0.78)_100%)]",
  ].join(" "),
};

function canAttemptVideo(posterBelowWidth: number) {
  if (typeof window === "undefined") return false;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  const connection = (navigator as Navigator & { connection?: ConnectionInfo }).connection;
  if (reducedMotion || connection?.saveData) return false;
  if (posterBelowWidth > 0 && window.innerWidth < posterBelowWidth) return false;
  return true;
}

/**
 * Full-bleed muted looping background video with poster fallback.
 * Pauses off-screen; respects reduced-motion and Save-Data.
 */
export default function CinematicBackground({
  videoId,
  className,
  overlayClassName,
  overlay = "section",
  priority = false,
  objectPosition,
}: CinematicBackgroundProps) {
  const asset = cinematicVideos[videoId];
  const rootRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [inView, setInView] = useState(priority);
  const [failed, setFailed] = useState(false);
  const [ready, setReady] = useState(false);
  const [motionOk, setMotionOk] = useState(true);

  const position = objectPosition || asset.objectPosition || "center center";
  const poster = asset.poster;
  const hasSources = Boolean(asset.available && asset.mp4);
  const useVideo = hasSources && !failed && motionOk;

  useEffect(() => {
    if (priority) return;
    const node = rootRef.current;
    if (!node) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        setInView(entry.isIntersecting);
      },
      { rootMargin: "200px 0px", threshold: 0.08 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [priority]);

  useEffect(() => {
    const refresh = () => {
      setMotionOk(canAttemptVideo(asset.posterBelowWidth ?? 0));
    };

    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    const connection = (navigator as Navigator & { connection?: ConnectionInfo }).connection;

    // Defer initial preference read so we do not sync-set during effect mount.
    const frame = window.requestAnimationFrame(refresh);

    reducedMotion.addEventListener("change", refresh);
    window.addEventListener("resize", refresh);
    connection?.addEventListener?.("change", refresh);

    return () => {
      window.cancelAnimationFrame(frame);
      reducedMotion.removeEventListener("change", refresh);
      window.removeEventListener("resize", refresh);
      connection?.removeEventListener?.("change", refresh);
    };
  }, [asset.posterBelowWidth]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (!useVideo || !inView || !hasSources || !asset.mp4) {
      video.pause();
      return;
    }

    let cancelled = false;

    const play = async () => {
      try {
        video.muted = true;
        await video.play();
        if (!cancelled) setReady(true);
      } catch {
        if (!cancelled) setFailed(true);
      }
    };

    const onVisibility = () => {
      if (document.visibilityState === "hidden") {
        video.pause();
      } else if (inView && useVideo) {
        void play();
      }
    };

    void play();
    document.addEventListener("visibilitychange", onVisibility);

    return () => {
      cancelled = true;
      document.removeEventListener("visibilitychange", onVisibility);
      video.pause();
    };
  }, [asset.mp4, hasSources, inView, useVideo]);

  return (
    <div
      ref={rootRef}
      className={cn(
        "pointer-events-none absolute inset-0 -z-10 overflow-hidden",
        asset.fallbackClassName,
        className,
      )}
      aria-hidden="true"
    >
      {poster ? (
        // eslint-disable-next-line @next/next/no-img-element -- decorative poster; avoid layout shift from next/image fill in absolute shell
        <img
          src={poster}
          alt=""
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            ready && useVideo ? "opacity-0" : "opacity-100",
          )}
          style={{ objectPosition: position }}
          loading={priority ? "eager" : "lazy"}
          decoding="async"
        />
      ) : null}

      {hasSources && useVideo && inView ? (
        <video
          ref={videoRef}
          className={cn(
            "absolute inset-0 h-full w-full object-cover transition-opacity duration-700",
            ready ? "opacity-100" : "opacity-0",
          )}
          style={{ objectPosition: position }}
          muted
          loop
          playsInline
          autoPlay
          preload={priority ? "metadata" : "none"}
          controls={false}
          disablePictureInPicture
          tabIndex={-1}
          poster={poster}
          onError={() => setFailed(true)}
          onPlaying={() => setReady(true)}
        >
          {asset.webm ? <source src={asset.webm} type="video/webm" /> : null}
          {asset.mp4 ? <source src={asset.mp4} type="video/mp4" /> : null}
        </video>
      ) : null}

      <div
        className={cn(
          "absolute inset-0",
          overlayByTone[overlay],
          overlayClassName,
        )}
      />
    </div>
  );
}
