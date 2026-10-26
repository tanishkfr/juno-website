import assert from "node:assert/strict";
import fs from "node:fs/promises";
import sharp from "sharp";
import { chromium } from "playwright";

const url = process.env.WEBSITE_URL ?? "http://127.0.0.1:5273/";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const page = await browser.newPage({ viewport: { width: 1366, height: 900 } });
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
await page.clock.install();
await page.goto(url);
await page.locator(".preview-toolbar").scrollIntoViewIfNeeded();
await page.mouse.move(5, 5);
await page.clock.runFor(5500);
assert.equal(
  await page
    .locator('[role="tab"][aria-selected="true"]')
    .textContent()
    .then((s) => s.trim()),
  "Workspace",
);
await page.clock.runFor(5000);
assert.equal(
  await page
    .locator('[role="tab"][aria-selected="true"]')
    .textContent()
    .then((s) => s.trim()),
  "Code",
);
await page.clock.runFor(5000);
assert.equal(
  await page
    .locator('[role="tab"][aria-selected="true"]')
    .textContent()
    .then((s) => s.trim()),
  "Conversation",
);
await page.getByRole("button", { name: "Pause tour", exact: true }).click();
await page.clock.runFor(8000);
assert.equal(
  await page.locator(".hero-stage").getAttribute("data-scene"),
  "conversation",
);
await page.getByRole("button", { name: "Play tour", exact: true }).click();
await page.clock.runFor(5500);
assert.equal(
  await page.locator(".hero-stage").getAttribute("data-scene"),
  "workspace",
);
await page.getByRole("tab", { name: "Code", exact: true }).click();
await page.clock.runFor(8000);
assert.equal(
  await page.locator(".hero-stage").getAttribute("data-scene"),
  "code",
);
assert.equal(
  await page.getByRole("button", { name: "Play tour", exact: true }).count(),
  1,
);
await page.getByRole("button", { name: "Play tour", exact: true }).click();
await page.locator(".hero-shot").hover();
await page.clock.runFor(8000);
assert.equal(
  await page.locator(".hero-stage").getAttribute("data-scene"),
  "code",
);
await page.mouse.move(5, 5);
await page.locator("#control").scrollIntoViewIfNeeded();
// Let the real renderer deliver IntersectionObserver before advancing the
// mocked timer by eight seconds. Network/paint latency varies on production.
await page.waitForTimeout(100);
await page.clock.runFor(8000);
assert.equal(
  await page.locator(".hero-stage").getAttribute("data-scene"),
  "code",
);
await page.locator(".company-section").scrollIntoViewIfNeeded();
await page.clock.runFor(100);
await page.waitForFunction(() =>
  document
    .querySelector("#company-orb")
    .getAttribute("src")
    .endsWith("idle.webp"),
);
assert.equal(
  await page.locator("#company-orb").getAttribute("src"),
  "/assets/kyoto-idle.webp",
);
await page
  .getByRole("button", { name: "Pause animation", exact: true })
  .click();
assert.equal(
  await page.locator("#company-orb").getAttribute("src"),
  "/assets/kyoto.png",
);
await page.getByRole("button", { name: "Play animation", exact: true }).click();
assert.equal(
  await page.locator("#company-orb").getAttribute("src"),
  "/assets/kyoto-idle.webp",
);
await page.emulateMedia({ reducedMotion: "reduce" });
await page.waitForFunction(() =>
  document
    .querySelector("#company-orb")
    .getAttribute("src")
    .endsWith("kyoto.png"),
);
assert.equal(
  await page.locator("#company-orb").getAttribute("src"),
  "/assets/kyoto.png",
);
assert(
  await page
    .getByRole("button", { name: "Tour paused", exact: true })
    .isDisabled(),
);
assert(
  await page
    .getByRole("button", { name: "Animation paused", exact: true })
    .isDisabled(),
);
await page.clock.runFor(8000);
assert.equal(
  await page.locator(".hero-stage").getAttribute("data-scene"),
  "code",
);
await page.close();
await browser.close();

// Real elapsed time + recorded frames verify that the browser renders the
// animated WebP, rather than only checking its URL or our own JS state.
const recordingBrowser = await chromium.launch({
  channel: "chrome",
  headless: true,
});
const context = await recordingBrowser.newContext({
  viewport: { width: 1366, height: 900 },
  recordVideo: { dir: "evidence/motion", size: { width: 1366, height: 900 } },
});
const live = await context.newPage();
live.on("pageerror", (e) => errors.push(e.message));
const recording = live.video();
await live.goto(url);
await live.evaluate(() => document.fonts.ready);
await live.locator(".company-section").scrollIntoViewIfNeeded();
await live.mouse.move(5, 5);
await live.waitForFunction(() =>
  document
    .querySelector("#company-orb")
    .getAttribute("src")
    .endsWith("idle.webp"),
);
await live.locator("#company-orb").evaluate((i) => i.decode());
await live.waitForTimeout(700);
const crop = { left: 850, top: 350, width: 400, height: 390 };
const pixels = (buffer) => sharp(buffer).extract(crop).raw().toBuffer();
const changed = (a, b) =>
  a.reduce(
    (count, value, i) => count + (Math.abs(value - b[i]) > 8 ? 1 : 0),
    0,
  );
const resting = await live.screenshot({
  path: "evidence/motion/kyoto-resting.png",
});
const rest = await pixels(resting);
let glance;
const deadline = Date.now() + 28000;
while (Date.now() < deadline) {
  await live.waitForTimeout(200);
  const candidate = await live.screenshot();
  if (changed(rest, await pixels(candidate)) > 100) {
    glance = candidate;
    break;
  }
}
assert(glance, "Rendered companion never changed expression");
await fs.writeFile("evidence/motion/kyoto-glance.png", glance);
await live.waitForTimeout(1100);
const returned = await live.screenshot({
  path: "evidence/motion/kyoto-loop-return.png",
});
assert.equal(
  changed(rest, await pixels(returned)),
  0,
  "Companion did not settle back to its resting expression",
);
await live.locator(".preview-toolbar").scrollIntoViewIfNeeded();
await live.waitForTimeout(6100);
await live.screenshot({ path: "evidence/motion/tour-workspace.png" });
assert.equal(
  await live.locator(".hero-stage").getAttribute("data-scene"),
  "workspace",
);
await context.close();
await fs.rename(await recording.path(), "evidence/motion/loops.webm");
await recordingBrowser.close();
const metadata = await sharp("public/assets/kyoto-idle.webp", {
  animated: true,
}).metadata();
assert.equal(errors.length, 0);
const results = {
  url,
  date: new Date().toISOString(),
  errors,
  checks: [
    "Tour completes all three views and wraps",
    "Pause and resume",
    "Manual selection stops autoplay",
    "Hover suspends tour",
    "Offscreen tour suspends",
    "Companion pause and resume",
    "Dynamic reduced motion stops both loops",
    "Real-time browser expression change and return to rest",
    "Real-time browser tour advances",
  ],
  companion: {
    pages: metadata.pages,
    duration: metadata.delay.reduce((a, b) => a + b, 0),
    bytes: (await fs.stat("public/assets/kyoto-idle.webp")).size,
  },
};
await fs.writeFile(
  "evidence/motion/verification.json",
  JSON.stringify(results, null, 2) + "\n",
);
console.log(JSON.stringify(results, null, 2));
