import assert from "node:assert/strict";
import { test } from "node:test";
import { connectAuthVideo } from "../lib/auth-visual-media.ts";

class MediaQuery extends EventTarget {
  constructor(matches) { super(); this.matches = matches; }
  change(matches) { this.matches = matches; this.dispatchEvent(new Event("change")); }
}

class Video extends EventTarget {
  style = { opacity: "0" };
  attributes = new Map();
  playCalls = 0;
  paused = true;
  playResult = Promise.resolve();
  hasAttribute(key) { return this.attributes.has(key); }
  getAttribute(key) { return this.attributes.get(key) ?? null; }
  setAttribute(key, value) { this.attributes.set(key, value); }
  removeAttribute(key) { this.attributes.delete(key); }
  play() { this.playCalls++; this.paused = false; return this.playResult; }
  pause() { this.paused = true; }
  load() {}
}

function setup(t, options = {}) {
  const desktop = new MediaQuery(options.desktop ?? true);
  const reduced = new MediaQuery(options.reduced ?? false);
  const connection = Object.assign(new EventTarget(), { saveData: options.saveData ?? false });
  const document = Object.assign(new EventTarget(), { visibilityState: "visible" });
  const globals = {
    window: { matchMedia: (query) => query.includes("min-width") ? desktop : reduced },
    document,
    navigator: { connection },
  };
  const restore = [];
  const cleanup = [];
  for (const [key, value] of Object.entries(globals)) {
    const original = Object.getOwnPropertyDescriptor(globalThis, key);
    Object.defineProperty(globalThis, key, { value, configurable: true });
    restore.push(() => original ? Object.defineProperty(globalThis, key, original) : delete globalThis[key]);
  }
  t.after(() => {
    cleanup.forEach((stop) => stop());
    restore.forEach((reset) => reset());
  });
  const video = new Video();
  const start = () => {
    const stop = connectAuthVideo(video, "/auth/juvo-v1/login-loop.mp4");
    cleanup.push(stop);
    return stop;
  };
  return { desktop, reduced, connection, document, video, start };
}

test("desktop video is muted and revealed only after playback starts", (t) => {
  const { video, start } = setup(t);
  start();
  assert.equal(video.muted, true);
  assert.equal(video.playCalls, 1);
  assert.equal(video.style.opacity, "0");
  video.dispatchEvent(new Event("playing"));
  assert.equal(video.style.opacity, "1");
});

for (const [name, options] of Object.entries({ mobile: { desktop: false }, "reduced motion": { reduced: true }, "data saving": { saveData: true } })) {
  test(`${name} does not attach or download the video`, (t) => {
    const { video, start } = setup(t, options);
    start();
    assert.equal(video.hasAttribute("src"), false);
    assert.equal(video.playCalls, 0);
  });
}

test("media preference changes unload the video and restore the static poster", (t) => {
  const { video, start, reduced, desktop, connection } = setup(t);
  start();
  video.dispatchEvent(new Event("playing"));
  reduced.change(true);
  assert.equal(video.style.opacity, "0");
  assert.equal(video.hasAttribute("src"), false);
  reduced.change(false);
  assert.equal(video.hasAttribute("src"), true);
  desktop.change(false);
  assert.equal(video.hasAttribute("src"), false);
  desktop.change(true);
  connection.saveData = true;
  connection.dispatchEvent(new Event("change"));
  assert.equal(video.hasAttribute("src"), false);
});

test("hidden tabs pause and resume; cleanup removes event subscriptions", (t) => {
  const { video, start, document, desktop } = setup(t);
  const stop = start();
  document.visibilityState = "hidden";
  document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(video.paused, true);
  document.visibilityState = "visible";
  document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(video.playCalls, 2);
  stop();
  desktop.change(false);
  desktop.change(true);
  document.dispatchEvent(new Event("visibilitychange"));
  video.dispatchEvent(new Event("playing"));
  assert.equal(video.playCalls, 2);
  assert.equal(video.hasAttribute("src"), false);
  assert.equal(video.style.opacity, "0");
});

test("blocked autoplay falls back permanently without retrying on tab focus", async (t) => {
  const { video, start, document } = setup(t);
  video.playResult = Promise.reject(new Error("Autoplay blocked"));
  start();
  await Promise.resolve();
  assert.equal(video.hasAttribute("src"), false);
  assert.equal(video.style.opacity, "0");
  document.dispatchEvent(new Event("visibilitychange"));
  assert.equal(video.playCalls, 1);
});

test("a late play rejection cannot disable playback after a media-query change", async (t) => {
  const { video, start, desktop } = setup(t);
  let reject;
  video.playResult = new Promise((_, rejectPlay) => { reject = rejectPlay; });
  start();
  desktop.change(false);
  video.playResult = Promise.resolve();
  desktop.change(true);
  reject(new Error("Aborted obsolete playback"));
  await Promise.resolve();
  video.dispatchEvent(new Event("playing"));
  assert.equal(video.style.opacity, "1");
  assert.equal(video.hasAttribute("src"), true);
});

test("a decoding or network error restores the poster", (t) => {
  const { video, start } = setup(t);
  start();
  video.dispatchEvent(new Event("playing"));
  video.dispatchEvent(new Event("error"));
  assert.equal(video.style.opacity, "0");
  assert.equal(video.paused, true);
  assert.equal(video.hasAttribute("src"), false);
});
