# JUVO Authentication Media

The login and registration pages use `AuthShell` and `AuthShowcase`. The existing
authentication actions, guest guards, redirects and password recovery links are
unchanged. Other authentication pages keep their existing layout.

## Playback

- Desktop (1024px and wider): left-side product preview, right-side form.
- Smaller viewports: form only; no video source is attached.
- Reduced-motion or data-saving preferences: static poster, no video download.
- Background tabs pause playback. Returning to the tab resumes it.
- Blocked autoplay, network errors and decoding errors leave the poster visible.
- Changing routes releases the video and all event listeners.

The artwork is fictional illustrative data, never a logged-in account preview.
The motion is deterministic compositing over generated images, not live trading
data or a generative video. No trade execution controls are included.

## Files

`public/auth/juvo-v1/` contains two H.264 MP4 loops (1080x1350, 24fps, eight seconds,
no audio) and their 2000x2500 PNG stills/posters. Each still is identical to its
poster; the poster is derived from the first decoded video frame. Next Image
serves responsive, optimized poster images in the application.

The generated source masters here are 1122x1402. The 2000x2500 deliverables are
resampled, not natively generated at that resolution. `PROMPTS.md` records the
generation instructions. `manifest.json` records rendered media specifications.

## Rebuild

Requires FFmpeg with libx264, FFprobe and the existing Node dependencies. Set
`FFMPEG_PATH` and `FFPROBE_PATH` to executable paths if they are not on PATH, then
run from the client directory:

```sh
node scripts/render-auth-assets.mjs
npm test
npm run lint
npm run build
```

Motion coordinates are tied to these masters. Replacing a master requires
reviewing the positions in the render script before regenerating the videos.
