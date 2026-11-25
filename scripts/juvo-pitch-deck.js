/**
 * JUVO — Idea2Impact Pitch Deck (Speaking-Cue Edition)
 * Don't just trade. Understand your trading.
 *
 * Design goal: 70% talking points / 30% supporting visuals.
 * Slides are prompts for a live founder presentation + product demo.
 *
 * Usage (from juvo/client):
 *   npm install pptxgenjs
 *   node scripts/juvo-pitch-deck.js
 *
 * Output: ../../../JUVO_Idea2Impact_Final_Pitch.pptx (workspace root)
 */

"use strict";

const pptxgen = require("pptxgenjs");
const path = require("path");
const fs = require("fs");
const os = require("os");
const JSZip = require("jszip");

// ─── Brand ───────────────────────────────────────────────────────────────────
const C = {
  navy: "0B132B",
  navyDeep: "070B14",
  blue: "1769C2",
  blueSoft: "EAF2FB",
  white: "FFFFFF",
  offWhite: "F8FAFC",
  slate: "64748B",
  dark: "0F172A",
  light: "E2E8F0",
  muted: "94A3B8",
  profit: "059669",
  loss: "DC2626",
};

const F = { head: "Calibri", body: "Calibri" };
const TOTAL = 12;

// ─── Assets (edit filenames here) ────────────────────────────────────────────
const IMAGE_DIR = path.join(__dirname, "..", "assets", "images");
const LOGO_DIR = path.join(__dirname, "..", "assets", "logos");

const ASSET_CANDIDATES = {
  logo: [path.join(LOGO_DIR, "applogo.png")],
  dashboard: [
    path.join(IMAGE_DIR, "juvo_dashboard.png"),
    path.join(IMAGE_DIR, "dashboard.png"),
  ],
  journal: [
    path.join(IMAGE_DIR, "juvo_ournal_page.png"),
    path.join(IMAGE_DIR, "journal.png"),
  ],
  analytics: [
    path.join(IMAGE_DIR, "juvo_analytics.png"),
    path.join(IMAGE_DIR, "analytics.png"),
  ],
  behavioral: [
    path.join(IMAGE_DIR, "juvo_behavioural -insights.png"),
    path.join(IMAGE_DIR, "behavioral-insights.png"),
  ],
  ai: [
    path.join(IMAGE_DIR, "juvo_ai.png"),
    path.join(IMAGE_DIR, "ai-assistant.png"),
  ],
  periodic: [
    path.join(IMAGE_DIR, "juvo_calendar.png"),
    path.join(IMAGE_DIR, "periodic-logs.png"),
  ],
  mt5: [path.join(IMAGE_DIR, "mt5.png")],
  ctrader: [path.join(IMAGE_DIR, "ctrader.png")],
  founder: [path.join(IMAGE_DIR, "authorImage.png")],
};

function resolveAsset(key) {
  for (const p of ASSET_CANDIDATES[key] || []) {
    if (p && fs.existsSync(p)) return p;
  }
  return null;
}

function getPngSize(filePath) {
  try {
    const buf = fs.readFileSync(filePath);
    if (buf.length < 24 || buf.toString("ascii", 1, 4) !== "PNG") return null;
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  } catch {
    return null;
  }
}

function fitContain(natW, natH, maxW, maxH) {
  const r = natW / natH;
  let w = maxW;
  let h = maxW / r;
  if (h > maxH) {
    h = maxH;
    w = maxH * r;
  }
  return { w, h };
}

/** Copy assets with spaces/odd names to a clean temp path for Office compatibility. */
function cleanImagePath(filePath, key) {
  const base = path.basename(filePath);
  if (!/[\s()]/.test(base)) return filePath;
  const ext = path.extname(base) || ".png";
  const dest = path.join(os.tmpdir(), `juvo-deck-${key}${ext}`);
  fs.copyFileSync(filePath, dest);
  return dest;
}

function addImageIfExists(slide, key, opts) {
  const {
    x,
    y,
    maxW,
    maxH,
    align = "left",
    valign = "top",
    shadow = false,
  } = opts;

  const file = resolveAsset(key);
  if (!file) return false;

  const safePath = cleanImagePath(file, key);
  const size = getPngSize(file) || { w: 16, h: 9 };
  const fitted = fitContain(size.w, size.h, maxW, maxH);

  // Guard against zero-size shapes (can break PowerPoint / mobile).
  if (fitted.w < 0.05 || fitted.h < 0.05) return false;

  let drawX = x;
  if (align === "center") drawX = x + (maxW - fitted.w) / 2;
  if (align === "right") drawX = x + (maxW - fitted.w);

  let drawY = y;
  if (valign === "middle") drawY = y + (maxH - fitted.h) / 2;
  if (valign === "bottom") drawY = y + (maxH - fitted.h);

  const imgOpts = {
    path: safePath,
    x: drawX,
    y: drawY,
    w: fitted.w,
    h: fitted.h,
  };
  if (shadow) {
    imgOpts.shadow = {
      type: "outer",
      color: "000000",
      opacity: 0.1,
      blur: 8,
      offset: 2,
      angle: 135,
    };
  }

  try {
    slide.addImage(imgOpts);
    return true;
  } catch (err) {
    console.warn(`Could not place "${key}":`, err.message);
    return false;
  }
}

/**
 * pptxgenjs 4.x can write Content_Types overrides for slideMaster2..N
 * that were never packaged. Desktop PowerPoint then asks to "repair";
 * mobile PowerPoint often refuses to open at all.
 */
async function repairPptxPackage(filePath) {
  const raw = fs.readFileSync(filePath);
  const zip = await JSZip.loadAsync(raw);

  // OPC packages must contain parts, not ZIP directory entries.
  const names = new Set();
  Object.keys(zip.files).forEach((n) => {
    const entry = zip.files[n];
    if (!entry) return;
    if (entry.dir) {
      delete zip.files[n];
      return;
    }
    names.add(n);
  });

  const ctFile = zip.file("[Content_Types].xml");
  if (!ctFile) throw new Error("Missing [Content_Types].xml");

  let ct = await ctFile.async("string");
  const before = (ct.match(/PartName="/g) || []).length;

  ct = ct.replace(/<Override\b[^>]*PartName="([^"]+)"[^>]*\/>/g, (full, partName) => {
    const inner = String(partName || "").replace(/^\//, "");
    return names.has(inner) ? full : "";
  });

  // Collapse leftover whitespace between tags
  ct = ct.replace(/>\s+</g, "><");

  const after = (ct.match(/PartName="/g) || []).length;
  zip.file("[Content_Types].xml", ct);

  const cleaned = await zip.generateAsync({
    type: "nodebuffer",
    compression: "DEFLATE",
    compressionOptions: { level: 6 },
  });
  fs.writeFileSync(filePath, cleaned);
  console.log(`Repaired Content_Types: ${before} → ${after} overrides`);
}

// ─── Layout helpers ──────────────────────────────────────────────────────────
function pageNum(slide, n, dark = false) {
  slide.addText(`${n} / ${TOTAL}`, {
    x: 8.9,
    y: 5.28,
    w: 0.8,
    h: 0.22,
    fontFace: F.body,
    fontSize: 9,
    color: dark ? C.muted : C.slate,
    align: "right",
    margin: 0,
  });
}

function kicker(slide, text) {
  slide.addText(text, {
    x: 0.55,
    y: 0.28,
    w: 8.5,
    h: 0.26,
    fontFace: F.head,
    fontSize: 10,
    bold: true,
    color: C.blue,
    charSpacing: 2,
    margin: 0,
  });
}

function headline(slide, text, y = 0.55, h = 0.55) {
  slide.addText(text, {
    x: 0.55,
    y,
    w: 9,
    h,
    fontFace: F.head,
    fontSize: 26,
    bold: true,
    color: C.navy,
    margin: 0,
    valign: "top",
  });
}

/** Vertical cue list — short prompts, not paragraphs */
function cueList(slide, items, opts = {}) {
  const {
    x = 0.55,
    y = 1.35,
    w = 5.4,
    gap = 0.48,
    fontSize = 16,
    color = C.dark,
    bulletColor = C.blue,
  } = opts;

  items.forEach((item, i) => {
    const yy = y + i * gap;
    slide.addShape("oval", {
      x,
      y: yy + 0.1,
      w: 0.14,
      h: 0.14,
      fill: { color: bulletColor },
      line: { width: 0 },
    });
    slide.addText(item, {
      x: x + 0.32,
      y: yy,
      w: w - 0.32,
      h: 0.4,
      fontFace: F.body,
      fontSize,
      color,
      margin: 0,
      valign: "middle",
    });
  });
}

function softCard(slide, x, y, w, h) {
  slide.addShape("roundRect", {
    x,
    y,
    w,
    h,
    fill: { color: C.offWhite },
    line: { color: C.light, width: 1 },
    rectRadius: 0.08,
  });
}

function addSpeakerNotes(slide, keyMessage, talkingPoints, transition, duration) {
  slide.addNotes(
    `Key message: ${keyMessage}\n\nExplain: ${talkingPoints}\n\nTransition: ${transition}\n\nSuggested duration: ${duration}`,
  );
}

// ─── Presentation ────────────────────────────────────────────────────────────
const pres = new pptxgen();
pres.layout = "LAYOUT_16x9";
pres.author = "Uchenna Raymond";
pres.title = "JUVO — Idea2Impact Pitch Deck";
pres.subject = "Speaking-cue deck for live product presentation";

const missing = Object.keys(ASSET_CANDIDATES).filter((k) => !resolveAsset(k));
if (missing.length) {
  console.log("Missing assets (skipped):", missing.join(", "));
}

// ═══════════════════════════════════════════════════════════════════════════
// 1 — JUVO
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.navyDeep };

  s.addShape("rect", {
    x: 0,
    y: 0,
    w: 0.1,
    h: 5.625,
    fill: { color: C.blue },
    line: { width: 0 },
  });

  // Logo plate
  s.addShape("roundRect", {
    x: 0.55,
    y: 0.85,
    w: 0.62,
    h: 0.62,
    fill: { color: C.navy },
    line: { color: "1E3A5F", width: 1 },
    rectRadius: 0.1,
  });
  if (
    !addImageIfExists(s, "logo", {
      x: 0.63,
      y: 0.93,
      maxW: 0.46,
      maxH: 0.46,
      align: "center",
      valign: "middle",
    })
  ) {
    s.addText("J", {
      x: 0.55,
      y: 0.85,
      w: 0.62,
      h: 0.62,
      fontFace: F.head,
      fontSize: 24,
      bold: true,
      color: C.white,
      align: "center",
      valign: "middle",
      margin: 0,
    });
  }

  s.addText("JUVO", {
    x: 0.55,
    y: 1.7,
    w: 9,
    h: 0.55,
    fontFace: F.head,
    fontSize: 40,
    bold: true,
    color: C.white,
    charSpacing: 3,
    margin: 0,
  });

  s.addText("The missing piece of every trader’s story.", {
    x: 0.55,
    y: 2.3,
    w: 9,
    h: 0.55,
    fontFace: F.head,
    fontSize: 22,
    color: "93C5FD",
    margin: 0,
  });
  s.addText("Trading Journal  ·  Behavioral Analytics  ·  Trading Discipline", {
    x: 0.55,
    y: 3.05,
    w: 8.8,
    h: 0.35,
    fontFace: F.body,
    fontSize: 14,
    color: C.light,
    margin: 0,
  });
  s.addText("Founder: Raymond", {
    x: 0.55,
    y: 4.65,
    w: 8.5,
    h: 0.28,
    fontFace: F.body,
    fontSize: 11,
    color: C.muted,
    margin: 0,
  });
  addSpeakerNotes(s, "JUVO helps traders understand the behavior behind their results.", "Introduce yourself as a trader who built a product around a problem you experienced. Keep the opening conversational.", "Move from the product promise to the gap between P/L and decision-making.", "30 seconds");
  pageNum(s, 1, true);
}

// ═══════════════════════════════════════════════════════════════════════════
// 2 — THE PROBLEM
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  kicker(s, "THE PROBLEM");
  headline(s, "Traders know what they made. But do they know why?");
  s.addText("WHAT MOST PLATFORMS SHOW", {
    x: 0.65, y: 1.55, w: 3.7, h: 0.3, fontFace: F.head,
    fontSize: 11, bold: true, color: C.slate, charSpacing: 1.2, margin: 0,
  });
  s.addText("PRICE  ·  BALANCE  ·  P/L", {
    x: 0.65, y: 2.0, w: 3.9, h: 0.5, fontFace: F.head,
    fontSize: 20, bold: true, color: C.navy, margin: 0,
  });
  s.addShape("rect", {
    x: 4.55, y: 1.48, w: 0.02, h: 2.75,
    fill: { color: C.light }, line: { width: 0 },
  });
  s.addText("WHAT OFTEN GOES UNRECORDED", {
    x: 5.0, y: 1.55, w: 4.0, h: 0.3, fontFace: F.head,
    fontSize: 11, bold: true, color: C.blue, charSpacing: 1.2, margin: 0,
  });
  cueList(s, [
    "FOMO or revenge trading",
    "Overtrading and impatience",
    "Breaking the trading plan",
    "Emotional entries",
  ], { x: 5.0, y: 2.0, w: 4.0, gap: 0.5, fontSize: 14 });
  s.addText("P/L records the outcome. It rarely explains the decision.", {
    x: 0.65, y: 4.55, w: 8.8, h: 0.4, fontFace: F.head,
    fontSize: 17, bold: true, color: C.navy, margin: 0,
  });
  addSpeakerNotes(s, "A result does not tell a trader whether the decision was sound.", "Contrast the data shown by execution platforms with the emotional and behavioral context traders often fail to record. Avoid suggesting every trader has the same experience.", "Ask what would change if that context could be reviewed over time.", "45 seconds");
  pageNum(s, 2);
}

// ═══════════════════════════════════════════════════════════════════════════
// 3 — THE INSIGHT
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  kicker(s, "THE INSIGHT");
  headline(s, "A trade is more than a number.", 0.5, 0.65);
  s.addText("Two traders can make the same profit.", {
    x: 0.55, y: 1.35, w: 8.8, h: 0.35, fontFace: F.head,
    fontSize: 20, bold: true, color: C.navy, margin: 0,
  });
  s.addText("One followed the plan. The other may have gotten lucky.", {
    x: 0.55, y: 1.8, w: 8.8, h: 0.35, fontFace: F.body,
    fontSize: 16, color: C.slate, margin: 0,
  });
  const flow = ["Decision", "Emotion", "Execution", "Outcome", "Lesson"];
  flow.forEach((label, i) => {
    const x = 0.55 + i * 1.86;
    softCard(s, x, 3.0, 1.65, 0.72);
    if (i === flow.length - 1) {
      s.addShape("roundRect", {
        x,
        y: 3.0,
        w: 1.65,
        h: 0.72,
        fill: { color: C.blue },
        line: { width: 0 },
        rectRadius: 0.08,
      });
    }
    s.addText(label, {
      x,
      y: 3.0,
      w: 1.65,
      h: 0.72,
      fontFace: F.head,
      fontSize: 13,
      bold: true,
      color: i === flow.length - 1 ? C.white : C.navy,
      align: "center",
      valign: "middle",
      margin: 0,
    });
    if (i < flow.length - 1) {
      s.addText("→", {
        x: x + 1.65,
        y: 3.12,
        w: 0.2,
        h: 0.35,
        fontFace: F.body,
        fontSize: 15,
        color: C.blue,
        align: "center",
        margin: 0,
      });
    }
  });
  s.addText("P/L alone cannot tell the difference. JUVO captures the context behind the trade.", {
    x: 0.55, y: 4.25, w: 8.8, h: 0.45, fontFace: F.body,
    fontSize: 15, color: C.dark, margin: 0,
  });
  addSpeakerNotes(s, "Trade context gives the outcome meaning.", "Explain the same-profit example. The key distinction is process versus outcome; JUVO is designed to record decisions and emotions alongside performance.", "Introduce JUVO as the product built to make that review practical.", "45 seconds");
  pageNum(s, 3);
}

// ═══════════════════════════════════════════════════════════════════════════
// 4 — THE SOLUTION (Meet JUVO)
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  kicker(s, "THE SOLUTION");
  headline(s, "Meet JUVO. Understand the trader behind the trades.");
  s.addText("A trading journal and behavioral analytics workspace for forex traders.", {
    x: 0.55, y: 1.45, w: 4.1, h: 0.7, fontFace: F.body,
    fontSize: 17, color: C.dark, margin: 0, breakLine: false,
  });
  cueList(s, [
    "Record trades, reasoning and emotions",
    "Track capital and performance",
    "Review history and recurring behavior",
  ], { x: 0.55, y: 2.5, w: 4.25, gap: 0.58, fontSize: 14 });
  addImageIfExists(s, "dashboard", {
    x: 5.05, y: 1.35, maxW: 4.45, maxH: 3.65,
    align: "center", valign: "middle", shadow: false,
  });
  addSpeakerNotes(s, "JUVO connects trading records with the context needed to review them.", "Present the dashboard as the entry point, then name the core loop: log, reflect, analyze. Use the actual application in the live demo; do not imply a missing screenshot is on this slide.", "Walk through what happens from account activity to insight.", "45 seconds");
  pageNum(s, 4);
}

// ═══════════════════════════════════════════════════════════════════════════
// 5 — HOW JUVO WORKS
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  kicker(s, "HOW JUVO WORKS");
  headline(s, "From account activity to self-awareness");
  const steps = [
    { t: "Connect / Log", d: "Manual entry or supported connection" },
    { t: "Journal", d: "Record reasoning and emotion" },
    { t: "Analyze", d: "Review outcomes over time" },
    { t: "Understand", d: "Notice recurring behavior" },
    { t: "Adjust", d: "Refine your process" },
  ];
  steps.forEach((st, i) => {
    const x = 0.55 + i * 1.82;
    s.addText(`0${i + 1}`, {
      x, y: 1.55, w: 0.45, h: 0.35, fontFace: F.head,
      fontSize: 12, bold: true, color: C.blue, margin: 0,
    });
    s.addText(st.t, {
      x, y: 2.0, w: 1.55, h: 0.45, fontFace: F.head,
      fontSize: 14, bold: true, color: C.navy, margin: 0,
    });
    s.addText(st.d, {
      x, y: 2.55, w: 1.55, h: 0.75, fontFace: F.body,
      fontSize: 11, color: C.slate, margin: 0, valign: "top",
    });
    if (i < steps.length - 1) {
      s.addShape("rect", {
        x: x + 1.57, y: 2.2, w: 0.18, h: 0.02,
        fill: { color: C.light }, line: { width: 0 },
      });
    }
  });
  s.addText("The value compounds as your personal trading history grows.", {
    x: 0.55, y: 3.65, w: 8.9, h: 0.3,
    fontFace: F.head, fontSize: 13, bold: true, color: C.navy, margin: 0,
  });
  addImageIfExists(s, "periodic", {
    x: 0.55, y: 4.0, maxW: 4.2, maxH: 1.15,
    align: "center", valign: "middle",
  });
  addImageIfExists(s, "ai", {
    x: 5.0, y: 4.0, maxW: 4.2, maxH: 1.15,
    align: "center", valign: "middle",
  });
  addSpeakerNotes(s, "JUVO turns raw trading activity into a repeatable review habit.", "Explain the product journey using one example: account or manual trade entry, journaling the decision, then reviewing outcomes and behavior. Avoid claiming automatic capture for every broker.", "Show the working capabilities that support this flow.", "45 seconds");
  pageNum(s, 5);
}

// ═══════════════════════════════════════════════════════════════════════════
// 6 — TECHNICAL EXECUTION
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  kicker(s, "TECHNICAL EXECUTION");
  headline(s, "Real screens. Real trading workflows.");
  const productShots = [
    { key: "journal", label: "JOURNAL", caption: "Decisions and reflections" },
    { key: "analytics", label: "ANALYTICS", caption: "Performance over time" },
    { key: "behavioral", label: "BEHAVIOR", caption: "Patterns to review" },
  ];
  productShots.forEach((shot, i) => {
    const x = 0.55 + i * 3.05;
    addImageIfExists(s, shot.key, {
      x, y: 1.55, maxW: 2.8, maxH: 1.65,
      align: "center", valign: "middle",
    });
    s.addText(shot.label, {
      x, y: 3.38, w: 2.8, h: 0.25, fontFace: F.head,
      fontSize: 10, bold: true, color: C.blue, charSpacing: 1, margin: 0,
    });
    s.addText(shot.caption, {
      x, y: 3.72, w: 2.8, h: 0.35, fontFace: F.body,
      fontSize: 12, color: C.dark, margin: 0,
    });
  });
  s.addShape("rect", {
    x: 0.55, y: 4.28, w: 8.9, h: 0.02,
    fill: { color: C.light }, line: { width: 0 },
  });
  s.addText("Accounts  ·  Trade capture  ·  Journal  ·  Analytics  ·  cTrader connection", {
    x: 0.55, y: 4.52, w: 8.9, h: 0.28, fontFace: F.head,
    fontSize: 12, bold: true, color: C.navy, margin: 0,
  });
  s.addText("MetaTrader connector pathway uses a desktop terminal, not the mobile app.", {
    x: 0.55, y: 4.9, w: 8.9, h: 0.25, fontFace: F.body,
    fontSize: 10, color: C.slate, margin: 0,
  });
  addSpeakerNotes(s, "JUVO is an application with account, trade, journaling and review workflows.", "Walk through these capabilities as product areas, then explain that cTrader is supported. Describe the MetaTrader connector accurately: it depends on a desktop terminal, not the MT4/MT5 mobile app. Only claim integration status you can demonstrate today.", "Connect the product to its target user and sustainable business model.", "60 seconds");
  pageNum(s, 6);
}

// ═══════════════════════════════════════════════════════════════════════════
// 7 — MARKET OPPORTUNITY
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  kicker(s, "MARKET & BUSINESS MODEL");
  headline(s, "A clear user. A recurring need. A product-led model.");
  const marketBlocks = [
    {
      title: "WHO",
      body: "Active retail forex traders who want to understand the habits behind their results.",
      x: 0.65, y: 1.55,
    },
    {
      title: "THE NEED",
      body: "Outcomes are visible; decision-making and behavior are harder to review systematically.",
      x: 5.15, y: 1.55,
    },
    {
      title: "WHY THEY RETURN",
      body: "Each recorded trade adds personal context. Over time, the review history makes patterns easier to compare.",
      x: 0.65, y: 3.0,
    },
    {
      title: "BUSINESS MODEL",
      body: "A free tier supports habit-building. Paid subscriptions can support advanced analytics, behavioral insights, AI and premium workflows.",
      x: 5.15, y: 3.0,
    },
  ];
  marketBlocks.forEach((item) => {
    s.addText(item.title, {
      x: item.x, y: item.y, w: 3.9, h: 0.28, fontFace: F.head,
      fontSize: 11, bold: true, color: C.blue, charSpacing: 1, margin: 0,
    });
    s.addText(item.body, {
      x: item.x, y: item.y + 0.38, w: 3.9, h: 0.82, fontFace: F.body,
      fontSize: 14, color: C.dark, margin: 0, valign: "top",
    });
  });
  s.addShape("rect", {
    x: 4.75, y: 1.55, w: 0.02, h: 2.35,
    fill: { color: C.light }, line: { width: 0 },
  });
  s.addShape("rect", {
    x: 0.65, y: 2.72, w: 8.4, h: 0.02,
    fill: { color: C.light }, line: { width: 0 },
  });
  s.addText("A qualitative opportunity — no unverified market or traction figures.", {
    x: 0.65, y: 4.55, w: 8.5, h: 0.3, fontFace: F.body,
    fontSize: 11, color: C.slate, italic: true, margin: 0,
  });
  addSpeakerNotes(s, "JUVO addresses a recurring review need with a product-led subscription opportunity.", "Identify active retail forex traders as the initial customer. Explain that the value comes from combining trading records, journal context, analytics and behavioral review. Personal history becomes more useful for comparison as it grows. A free tier can establish the habit, with paid tiers supporting premium capabilities; do not claim specific pricing, demand or conversion.", "Differentiate JUVO as a complement to execution platforms, not a replacement.", "60 seconds");
  pageNum(s, 7);
}

// ═══════════════════════════════════════════════════════════════════════════
// 8 — CONNECTIONS
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  kicker(s, "DIFFERENTIATION");
  headline(s, "Trading platforms show performance. JUVO helps explain it.");
  const compare = [
    ["EXECUTION PLATFORM", "JUVO"],
    ["Price and account activity", "Trade history with context"],
    ["Balance and P/L", "Performance plus journal review"],
    ["Order execution", "Reasoning, emotion and plan reflection"],
    ["Position monitoring", "Behavior patterns and discipline"],
  ];
  compare.forEach((row, i) => {
    const y = 1.45 + i * 0.68;
    const header = i === 0;
    s.addText(row[0], {
      x: 0.7, y, w: 3.8, h: 0.42, fontFace: F.head,
      fontSize: header ? 11 : 14, bold: true,
      color: header ? C.slate : C.dark, margin: 0, valign: "middle",
    });
    s.addText(row[1], {
      x: 5.15, y, w: 4.0, h: 0.42, fontFace: F.head,
      fontSize: header ? 11 : 14, bold: true,
      color: header ? C.blue : C.navy, margin: 0, valign: "middle",
    });
    if (i > 0) s.addShape("rect", {
      x: 0.7, y: y + 0.53, w: 8.55, h: 0.012,
      fill: { color: C.light }, line: { width: 0 },
    });
  });
  s.addText("Different roles. One more complete view of the trader’s process.", {
    x: 0.7, y: 4.95, w: 8.6, h: 0.35, fontFace: F.body,
    fontSize: 14, color: C.slate, margin: 0,
  });
  addSpeakerNotes(s, "JUVO complements trading platforms; it is not an execution platform.", "Avoid unsupported claims about competitors. Compare the category focus: execution and account data versus journaling, reflection and behavior review.", "Transition from explanation to a short live product demonstration.", "40 seconds");
  pageNum(s, 8);
}

// ═══════════════════════════════════════════════════════════════════════════
// 9 — LIVE DEMO
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.navyDeep };

  s.addShape("rect", {
    x: 0,
    y: 0,
    w: 0.1,
    h: 5.625,
    fill: { color: C.blue },
    line: { width: 0 },
  });

  s.addText("Let’s see what happens\nbeyond the trade.", {
    x: 0.6,
    y: 1.0,
    w: 8.5,
    h: 1.2,
    fontFace: F.head,
    fontSize: 34,
    bold: true,
    color: C.white,
    margin: 0,
  });
  s.addText("LIVE PRODUCT DEMONSTRATION", {
    x: 0.6,
    y: 2.45,
    w: 8.5,
    h: 0.35,
    fontFace: F.body,
    fontSize: 12,
    bold: true,
    color: "93C5FD",
    charSpacing: 1.5,
    margin: 0,
  });
  addSpeakerNotes(s, "The next section is the real JUVO application, not a mock-up.", "Switch to the live app. Show dashboard, account, a trade record, journaling context, analytics and behavioral insights. Keep the walkthrough focused and use real data only.", "After the demo, explain the vision for helping traders develop greater self-awareness and discipline.", "3–5 minutes");
  pageNum(s, 9, true);
}

// ═══════════════════════════════════════════════════════════════════════════
// 10 — THE VISION
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.white };
  kicker(s, "THE VISION");
  headline(s, "Help traders build self-awareness, consistency and discipline.");
  s.addText("Today", {
    x: 0.65, y: 1.65, w: 1.5, h: 0.35, fontFace: F.head,
    fontSize: 13, bold: true, color: C.blue, margin: 0,
  });
  s.addText("A place to record, review and understand trading behavior.", {
    x: 0.65, y: 2.1, w: 3.75, h: 0.75, fontFace: F.body,
    fontSize: 16, color: C.dark, margin: 0,
  });
  s.addShape("rect", {
    x: 4.85, y: 1.6, w: 0.025, h: 2.5,
    fill: { color: C.light }, line: { width: 0 },
  });
  s.addText("Over time", {
    x: 5.35, y: 1.65, w: 2.0, h: 0.35, fontFace: F.head,
    fontSize: 13, bold: true, color: C.blue, margin: 0,
  });
  s.addText("A more complete trading-development workspace — shaped by what traders actually need.", {
    x: 5.35, y: 2.1, w: 3.75, h: 1.0, fontFace: F.body,
    fontSize: 16, color: C.dark, margin: 0,
  });
  s.addText("The ambition is long-term. The product grows through real use and honest feedback.", {
    x: 0.65, y: 4.4, w: 8.6, h: 0.4, fontFace: F.head,
    fontSize: 15, bold: true, color: C.navy, margin: 0,
  });
  addSpeakerNotes(s, "JUVO’s vision is to help traders improve through reflection, not promise trading outcomes.", "Share that the founder experienced the gap personally: P/L did not explain decisions or repeated mistakes. The future direction is to deepen the product based on trader needs; do not present future capabilities as already shipped.", "Invite the audience to experience the product and help shape it.", "45 seconds");
  pageNum(s, 10);
}

// ═══════════════════════════════════════════════════════════════════════════
// 11 — CALL TO ACTION
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.navyDeep };

  s.addShape("rect", {
    x: 0,
    y: 0,
    w: 0.1,
    h: 5.625,
    fill: { color: C.blue },
    line: { width: 0 },
  });

  s.addText("Don’t just hear about JUVO.\nExperience it.", {
    x: 0.55,
    y: 0.72,
    w: 5.75,
    h: 1.0,
    fontFace: F.head,
    fontSize: 27,
    bold: true,
    color: C.white,
    margin: 0,
  });
  s.addText("juvo-os.app", {
    x: 0.6, y: 2.0, w: 5.4, h: 0.45, fontFace: F.head,
    fontSize: 20, bold: true, color: "93C5FD", margin: 0,
  });
  s.addText("Scan to explore JUVO.\nCreate an account. Experience the product.\n\nLooking for traders willing to try it and share honest feedback.", {
    x: 0.6, y: 2.65, w: 5.3, h: 1.35, fontFace: F.body,
    fontSize: 14, color: C.light, margin: 0, breakLine: false,
  });
  s.addShape("rect", {
    x: 6.65, y: 1.15, w: 2.45, h: 2.45,
    fill: { color: C.white }, line: { color: C.light, width: 1 },
  });
  s.addText("QR CODE", {
    x: 6.65, y: 1.15, w: 2.45, h: 2.45, fontFace: F.head,
    fontSize: 13, bold: true, color: C.muted, charSpacing: 1.2,
    align: "center", valign: "middle", margin: 0,
  });
  s.addText("SCAN TO EXPLORE", {
    x: 6.65, y: 3.78, w: 2.45, h: 0.3, fontFace: F.head,
    fontSize: 10, bold: true, color: C.muted, charSpacing: 1.1,
    align: "center", margin: 0,
  });
  addSpeakerNotes(s, "The ask is to try JUVO and give honest feedback.", "Point to juvo-os.app and the intentionally blank QR placeholder. Insert the final QR image manually before presenting. Invite traders to create an account, try the product and tell you what is useful or confusing.", "Close with the product promise.", "30 seconds");
  pageNum(s, 11, true);
}

// ═══════════════════════════════════════════════════════════════════════════
// 12 — CLOSING
// ═══════════════════════════════════════════════════════════════════════════
{
  const s = pres.addSlide();
  s.background = { color: C.navyDeep };
  addImageIfExists(s, "logo", {
    x: 0.65, y: 0.8, maxW: 0.72, maxH: 0.72,
    align: "left", valign: "middle",
  });
  s.addText("JUVO", {
    x: 0.65, y: 1.8, w: 8.8, h: 0.75, fontFace: F.head,
    fontSize: 42, bold: true, color: C.white, charSpacing: 3, margin: 0,
  });
  s.addText("Don’t just trade. Understand your trading.", {
    x: 0.65, y: 2.8, w: 8.8, h: 0.45, fontFace: F.head,
    fontSize: 21, bold: true, color: "93C5FD", margin: 0,
  });
  s.addText("The missing piece of every trader’s story.", {
    x: 0.65, y: 3.45, w: 8.8, h: 0.4, fontFace: F.body,
    fontSize: 16, color: C.light, margin: 0,
  });
  addSpeakerNotes(s, "Leave the audience with JUVO’s core promise.", "Pause after the final line. Invite follow-up conversations with interested traders.", "End.", "10 seconds");
  pageNum(s, 12, true);
}

// ─── Write ───────────────────────────────────────────────────────────────────
const outPath = path.join(__dirname, "..", "..", "..", "JUVO_Idea2Impact_Final_Pitch.pptx");
const desktopCopy = path.join(os.homedir(), "Desktop", "JUVO_Idea2Impact_Final_Pitch.pptx");

pres
  .writeFile({ fileName: outPath })
  .then(async () => {
    await repairPptxPackage(outPath);
    fs.copyFileSync(outPath, desktopCopy);
    console.log("Wrote", outPath);
    console.log("Also copied to", desktopCopy);
    console.log("Resolved assets:");
    for (const key of Object.keys(ASSET_CANDIDATES)) {
      const p = resolveAsset(key);
      console.log(`  ${key}: ${p ? path.basename(p) : "(missing)"}`);
    }
  })
  .catch((err) => {
    console.error(err);
    process.exit(1);
  });
