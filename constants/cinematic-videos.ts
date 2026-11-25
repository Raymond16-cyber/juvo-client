/**
 * Central registry for marketing cinematic backgrounds.
 *
 * Served from /public for stable URLs. Source masters live in
 * `assets/videos/` — copy/encode into public when replacing clips.
 *
 * Outstanding assets (not yet supplied):
 * - juvo-analytics.mp4 / .webm + juvo-analytics-poster.webp
 * - juvo-ai.mp4 / .webm + juvo-ai-poster.webp
 */

export type CinematicVideoId = "hero" | "behaviour" | "analytics" | "ai";

export type CinematicVideoAsset = {
  id: CinematicVideoId;
  /** Short label for docs / future CMS */
  label: string;
  /** Section(s) this clip is intended for */
  section: string;
  /** Ready for playback when mp4 (and preferably webm) exist */
  available: boolean;
  mp4?: string;
  webm?: string;
  poster?: string;
  /** Fallback solid / gradient when media missing */
  fallbackClassName: string;
  objectPosition?: string;
  /** Prefer poster-only under this viewport width (px). Hero can still play. */
  posterBelowWidth?: number;
};

export const cinematicVideos: Record<CinematicVideoId, CinematicVideoAsset> = {
  hero: {
    id: "hero",
    label: "Hero — night trading desk",
    section: "Hero (#top)",
    available: true,
    mp4: "/videos/juvo-hero.mp4",
    webm: "/videos/juvo-hero.webm",
    poster: "/images/video-posters/juvo-hero-poster.webp",
    fallbackClassName: "bg-[#050816]",
    objectPosition: "center center",
    // Keep motion on phones; clip is short and webm is ~0.4MB
    posterBelowWidth: 0,
  },
  behaviour: {
    id: "behaviour",
    label: "Behavioural insights — review & reflection",
    section: "Behavioral insights (#insights)",
    available: true,
    mp4: "/videos/juvo-behaviour.mp4",
    webm: "/videos/juvo-behaviour.webm",
    poster: "/images/video-posters/juvo-behaviour-poster.webp",
    fallbackClassName: "bg-[#070b14]",
    objectPosition: "center 30%",
    // Below-fold: poster on small screens to save data
    posterBelowWidth: 768,
  },
  analytics: {
    id: "analytics",
    label: "Analytics — charts & measurement",
    section: "Analytics (#analytics)",
    available: false,
    poster: "/images/video-posters/juvo-analytics-poster.webp",
    fallbackClassName: "bg-[#070b14]",
    objectPosition: "center center",
    posterBelowWidth: 768,
  },
  ai: {
    id: "ai",
    label: "JUVO AI — focused workstation",
    section: "JUVO AI (when section ships)",
    available: false,
    poster: "/images/video-posters/juvo-ai-poster.webp",
    fallbackClassName: "bg-[#050816]",
    objectPosition: "center center",
    posterBelowWidth: 768,
  },
};

export const requiredCinematicAssets = [
  {
    id: "analytics" as const,
    files: [
      "public/videos/juvo-analytics.mp4",
      "public/videos/juvo-analytics.webm",
      "public/images/video-posters/juvo-analytics-poster.webp",
    ],
    note: "Close-up of charts / performance analysis. Do not compete with product UI.",
  },
  {
    id: "ai" as const,
    files: [
      "public/videos/juvo-ai.mp4",
      "public/videos/juvo-ai.webm",
      "public/images/video-posters/juvo-ai-poster.webp",
    ],
    note: "Dark workstation / laptop interaction. No holograms or robots.",
  },
];
