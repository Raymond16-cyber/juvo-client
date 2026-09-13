import { spawn } from "node:child_process";
import { once } from "node:events";
import { copyFile, mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const sourceDir = path.join(root, "design/auth/juvo-v1");
const outputDir = path.join(root, "public/auth/juvo-v1");
const ffmpeg = process.env.FFMPEG_PATH || "ffmpeg";
const ffprobe = process.env.FFPROBE_PATH || "ffprobe";
const width = 1080;
const height = 1350;
const fps = 24;
const frames = 192;
const cyan = "#00D4FF";

function run(binary, args, options = {}) {
  return new Promise((resolve, reject) => {
    const process = spawn(binary, args, { windowsHide: true, ...options });
    let stdout = "";
    let stderr = "";
    process.stdout?.on("data", (data) => { stdout += data; });
    process.stderr?.on("data", (data) => { stderr = (stderr + data).slice(-16000); });
    process.on("error", reject);
    process.on("close", (code) => code === 0 ? resolve(stdout) : reject(new Error(stderr || `Process exited ${code}`)));
  });
}

function text(value, x, y, size, color, align = "start") {
  return `<text x="${x}" y="${y}" font-family="Segoe UI, Arial, sans-serif" font-size="${size}" font-weight="400" fill="${color}" text-anchor="${align}">${value}</text>`;
}

function loginMotion(frame) {
  const phase = frame / (frames - 1);
  const t = frame / fps;
  const pulse = Math.sin(Math.PI * phase) ** 2;
  let result = `<circle cx="703" cy="151" r="8" fill="none" stroke="${cyan}" stroke-width="1.5" opacity="${pulse * 0.55}"/>`;
  if (t >= 1.5 && t < 6.5) {
    const cents = [32, 26, 34, 28, 30][Math.min(4, Math.floor(t - 1.5))];
    const floating = `+4.${cents}`;
    const position = `12.${cents + 10}`;
    result += `<rect x="845" y="252" width="130" height="46" rx="3" fill="#1d252a"/>
      ${text(floating, 849, 287, 40, "#55d76a")}
      <rect x="640" y="303" width="72" height="27" rx="2" fill="#1e272c"/>
      ${text(`+${position}`, 644, 323, 16, "#00d9bd")}
      <rect x="967" y="329" width="45" height="20" fill="#1c2429"/>
      ${text(position, 1007, 344, 14, "#e6e9eb", "end")}
      <rect x="961" y="377" width="51" height="23" fill="#1c2429"/>
      ${text(floating, 1007, 393, 14, "#f0f1f2", "end")}`;
  }

  const wave = Math.sin(phase * Math.PI * 2) * 2.5;
  result += `<g opacity="${pulse * 0.7}">
    <path d="M 980 568 Q 991 ${561 + wave} 1002 ${565 + wave}" fill="none" stroke="${cyan}" stroke-width="1.4"/>
    <circle cx="1002" cy="${565 + wave}" r="4.5" fill="#1c2429" stroke="${cyan}" stroke-width="1.6"/>
  </g>`;

  const appear = t < 2 || t > 5.3 ? 0 : Math.min(1, (t - 2) / 0.6, (5.3 - t) / 0.6);
  const eased = appear * appear * (3 - 2 * appear);
  result += `<g opacity="${eased}" transform="translate(0 ${8 * (1 - eased)})">
    <rect x="186" y="523" width="224" height="34" rx="6" fill="#222e34" stroke="#36616b" stroke-width="1"/>
    <rect x="198" y="533" width="3" height="14" rx="1.5" fill="${cyan}"/>
    ${text("Review entry timing", 211, 545, 14, "#edf2f4")}
  </g>`;
  return result;
}

function registerMotion(frame) {
  const phase = frame / (frames - 1);
  const sections = [
    { x: 240, y: 365, w: 711, h: 114, center: 309 },
    { x: 240, y: 591, w: 711, h: 145, center: 537 },
    { x: 240, y: 839, w: 711, h: 199, center: 786 },
    { x: 240, y: 1138, w: 711, h: 157, center: 1088 },
  ];
  return sections.map((section, index) => {
    const local = Math.max(0, Math.min(1, phase * 4 - index));
    const emphasis = Math.sin(local * Math.PI) ** 2;
    return `<g opacity="${emphasis * 0.55}">
      <rect x="${section.x}" y="${section.y}" width="${section.w}" height="${section.h}" rx="16" fill="none" stroke="${cyan}" stroke-width="1.7"/>
      <circle cx="210" cy="${section.center}" r="25" fill="none" stroke="${cyan}" stroke-width="1.2"/>
      <path d="M 210 ${section.center + 26} L 210 ${section.center + 48}" fill="none" stroke="${cyan}" stroke-width="1.7"/>
    </g>`;
  }).join("");
}

function overlay(frame, kind) {
  // Identical endpoints prevent a visible jump when the browser loops the clip.
  const elements = frame === 0 || frame === frames - 1 ? "" : kind === "login" ? loginMotion(frame) : registerMotion(frame);
  return Buffer.from(`<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 1122 1402">${elements}</svg>`);
}

async function render(kind) {
  const master = path.join(sourceDir, `${kind}-master.png`);
  const metadata = await sharp(master).metadata();
  if (metadata.width !== 1122 || metadata.height !== 1402) throw new Error(`Unexpected ${kind} master dimensions; motion coordinates need review.`);
  const video = path.join(outputDir, `${kind}-loop.mp4`);
  const encoder = spawn(ffmpeg, [
    "-hide_banner", "-loglevel", "error", "-y", "-loop", "1", "-framerate", String(fps), "-i", master,
    "-f", "rawvideo", "-pixel_format", "rgba", "-video_size", `${width}x${height}`, "-framerate", String(fps), "-i", "pipe:0",
    "-filter_complex", `[0:v]scale=${width}:${height}:flags=lanczos,format=rgba[base];[base][1:v]overlay=shortest=1:format=auto,format=yuv420p[out]`,
    "-map", "[out]", "-an", "-c:v", "libx264", "-preset", "medium", "-crf", "18", "-threads", "2",
    "-r", String(fps), "-frames:v", String(frames), "-movflags", "+faststart", video,
  ], { windowsHide: true, stdio: ["pipe", "ignore", "pipe"] });
  let stderr = "";
  encoder.stderr.on("data", (data) => { stderr = (stderr + data).slice(-16000); });
  encoder.stdin.on("error", () => {});
  const finished = new Promise((resolve, reject) => {
    encoder.on("error", reject);
    encoder.on("close", (code) => code === 0 ? resolve() : reject(new Error(stderr || `Encoder exited ${code}`)));
  });
  void finished.catch(() => {});
  try {
    for (let frame = 0; frame < frames; frame++) {
      const rgba = await sharp(overlay(frame, kind)).ensureAlpha().raw().toBuffer();
      if (!encoder.stdin.write(rgba)) await Promise.race([once(encoder.stdin, "drain"), finished]);
      if ((frame + 1) % 48 === 0) console.log(`${kind}: ${frame + 1}/${frames} frames`);
    }
    encoder.stdin.end();
    await finished;
  } catch (error) {
    encoder.kill();
    throw error;
  }

  const poster = path.join(outputDir, `${kind}-poster.png`);
  await run(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", "-i", video, "-frames:v", "1", "-vf", "scale=2000:2500:flags=lanczos", "-update", "1", poster]);
  await copyFile(poster, path.join(outputDir, `${kind}.png`));
  const information = JSON.parse(await run(ffprobe, ["-v", "error", "-show_streams", "-show_format", "-of", "json", video]));
  const videoStream = information.streams.find((stream) => stream.codec_type === "video");
  if (information.streams.some((stream) => stream.codec_type === "audio")) throw new Error("Unexpected audio track");
  if (videoStream.width !== width || videoStream.height !== height || Number(videoStream.nb_frames) !== frames || Number(information.format.duration) !== 8) throw new Error("Video dimensions, duration or frame count do not match the specification.");
  console.log(`${kind}: verified 1080x1350, 192 frames, 8 seconds, no audio`);
  return { kind, master: `design/auth/juvo-v1/${kind}-master.png`, sourceWidth: metadata.width, sourceHeight: metadata.height, imageWidth: 2000, imageHeight: 2500, videoWidth: width, videoHeight: height, fps, frames, durationSeconds: 8, videoBytes: Number(information.format.size), audio: false };
}

await mkdir(outputDir, { recursive: true });
const assets = [];
for (const kind of ["login", "register"]) assets.push(await render(kind));
await writeFile(path.join(outputDir, "manifest.json"), JSON.stringify({ version: 1, stillGeneration: "Built-in image generation", videoGeneration: "Deterministic motion graphics composited over the generated stills with FFmpeg", posterDerivation: "First decoded video frame resampled to 2000x2500; matching still and poster are identical", assets }, null, 2));
