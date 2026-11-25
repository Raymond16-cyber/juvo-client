# JUVO cinematic marketing videos

Public copies used by `CinematicBackground`. Masters live in `assets/videos/`.

## Present

| File | Section | Notes |
|------|---------|-------|
| `juvo-hero.mp4` / `.webm` | Hero (`#top`) | From `assets/videos/hero-video.mp4` |
| `juvo-behaviour.mp4` / `.webm` | Behavioral insights (`#insights`) | From `assets/videos/behavioural-video.mp4` |

Posters: `public/images/video-posters/juvo-*-poster.webp`

## Still required

| File | Intended section | Creative brief |
|------|------------------|----------------|
| `juvo-analytics.mp4` (+ `.webm` + poster) | Analytics (`#analytics`) | Charts / performance desk. Keep product UI as the star. |
| `juvo-ai.mp4` (+ `.webm` + poster) | Future JUVO AI marketing block | Dark workstation / laptop. No holograms or robots. |

After adding masters under `assets/videos/`, encode into this folder (720p, ~6–12s, muted-friendly loop) and set `available: true` in `constants/cinematic-videos.ts`.
