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
assert.equal(await page.locator("#preview-playback, #character-playback").count(), 0);
await page.locator(".hero-shot").hover();
await page.clock.runFor(8000);
assert.equal(
  await page.locator(".hero-stage").getAttribute("data-scene"),
  "conversation",
);
await page.mouse.move(5, 5);
await page.getByRole("tab", { name: "Code", exact: true }).click();
await page.clock.runFor(8000);
assert.equal(await page.locator(".hero-stage").getAttribute("data-scene"), "code");
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
    .endsWith("expressions.webp"),
);
assert.equal(
  await page.locator("#company-orb").getAttribute("src"),
  "/assets/kyoto-expressions.webp",
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
  "/assets/kyoto-expressions.webp",
);
for (const [id, name] of [
  ["kyoto", "Kyoto"],
  ["prague", "Prague"],
  ["lisbon", "Lisbon"],
  ["seoul", "Seoul"],
  ["toronto", "Toronto"],
  ["new-york", "New York"],
]) {
  await page.getByRole("button", { name, exact: true }).click();
  await page.locator("#companion-portrait").scrollIntoViewIfNeeded();
  await page.waitForFunction(
    (expected) =>
      document.querySelector("#portrait-img").getAttribute("src") === expected,
    `/assets/${id}-expressions.webp`,
  );
  await page.locator("#portrait-img").evaluate((i) => i.decode());
}
await page
  .getByRole("button", { name: "Pause expressions", exact: true })
  .click();
assert.equal(
  await page.locator("#portrait-img").getAttribute("src"),
  "/assets/new-york.png",
);
await page
  .getByRole("button", { name: "Play expressions", exact: true })
  .click();
assert.equal(
  await page.locator("#portrait-img").getAttribute("src"),
  "/assets/new-york-expressions.webp",
);
const decorativeOrbs = page.locator("img[data-orb]");
assert.equal(await decorativeOrbs.count(), 20);
for (let i = 0; i < (await decorativeOrbs.count()); i++) {
  const orb = decorativeOrbs.nth(i);
  await orb.scrollIntoViewIfNeeded();
  // The loop starts once the visibility observer reports the orb; allow for
  // a slow frame instead of assuming a fixed delay.
  await orb.evaluate(
    (image) =>
      new Promise((resolve, reject) => {
        const expected = `/assets/${image.dataset.orb}-expressions.webp`;
        const started = Date.now();
        (function poll() {
          if (image.getAttribute("src") === expected) resolve(true);
          else if (Date.now() - started > 4000)
            reject(new Error(`Expression loop did not start: ${image.dataset.orb}`));
          else requestAnimationFrame(poll);
        })();
      }),
  );
  await orb.evaluate((image) => image.decode());
}
await page.locator("#portrait-playback").click();
assert.equal(await page.locator('img[src$="-expressions.webp"]').count(), 0);
await page.locator("#portrait-playback").click();
await page.waitForTimeout(100);
assert(
  (await page.locator('img[data-orb][src$="-expressions.webp"]').count()) > 0,
);
await page.emulateMedia({ reducedMotion: "reduce" });
await page.waitForFunction(
  () =>
    document.querySelector("#portrait-img").getAttribute("src") ===
    "/assets/new-york.png",
);
assert(
  await page
    .getByRole("button", { name: "Expressions paused", exact: true })
    .isDisabled(),
);
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
assert(await page.locator("#workflow-demo").evaluate((v) => v.paused && !v.autoplay));
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
// These checks compare the companion's pixels between frames. The sky behind
// it drifts on its own, so it is hidden here to isolate the expression loop.
await live.addStyleTag({ content: "#sky{visibility:hidden}" });
await live.evaluate(() => document.fonts.ready);
await live.locator(".company-section").scrollIntoViewIfNeeded();
await live.mouse.move(5, 5);
await live.waitForFunction(() =>
  document
    .querySelector("#company-orb")
    .getAttribute("src")
    .endsWith("expressions.webp"),
);
await live.locator("#company-orb").evaluate((i) => i.decode());
// The cast walks in on scroll; let that scene come to rest before sampling.
await live.waitForTimeout(2200);
// Measure the companion where the layout actually places it.
const crop = await live.locator("#company-orb").evaluate((orb) => {
  const box = orb.getBoundingClientRect();
  return {
    left: Math.max(0, Math.floor(box.left)),
    top: Math.max(0, Math.floor(box.top)),
    width: Math.floor(box.width),
    height: Math.floor(Math.min(box.height, innerHeight - Math.max(0, box.top))),
  };
});
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
let returned;
const restDeadline = Date.now() + 4000;
while (Date.now() < restDeadline) {
  await live.waitForTimeout(200);
  returned = await live.screenshot();
  if (changed(rest, await pixels(returned)) === 0) break;
}
await fs.writeFile("evidence/motion/kyoto-loop-return.png", returned);
assert.equal(
  changed(rest, await pixels(returned)),
  0,
  "Companion did not settle back to its resting expression",
);
await live.getByRole("button", { name: "Seoul", exact: true }).click();
await live.locator("#companion-portrait").scrollIntoViewIfNeeded();
await live.waitForFunction(
  () =>
    document.querySelector("#portrait-img").getAttribute("src") ===
    "/assets/seoul-expressions.webp",
);
await live.locator("#portrait-img").evaluate((i) => i.decode());
await live.waitForTimeout(4000);
await live.screenshot({ path: "evidence/motion/portrait-smile.png" });
await live
  .getByRole("button", { name: "Pause expressions", exact: true })
  .click();
await live.screenshot({ path: "evidence/motion/portrait-resting.png" });
await live.locator("#portrait-playback").click();
for (const [selector, stem] of [
  [".hero-orb", "hero-orb"],
  [".team-cast", "team-orbs"],
]) {
  const group = live.locator(selector);
  await group.scrollIntoViewIfNeeded();
  await live.mouse.move(5, 5);
  await live.waitForTimeout(300);
  const initial = await group.screenshot({
    path: `evidence/motion/${stem}-resting.png`,
  });
  const initialPixels = await sharp(initial).raw().toBuffer();
  let expression;
  const end = Date.now() + 14000;
  while (Date.now() < end) {
    await live.waitForTimeout(150);
    const next = await group.screenshot();
    if (changed(initialPixels, await sharp(next).raw().toBuffer()) > 100) {
      expression = next;
      break;
    }
  }
  assert(expression, `${selector} never changed expression in the browser`);
  await fs.writeFile(`evidence/motion/${stem}-expression.png`, expression);
}
await live.locator(".preview-toolbar").scrollIntoViewIfNeeded();
await live.mouse.move(5, 5);
await live.waitForTimeout(6100);
await live.screenshot({ path: "evidence/motion/tour-workspace.png" });
assert.equal(
  await live.locator(".hero-stage").getAttribute("data-scene"),
  "workspace",
);
await context.close();
await fs.rename(await recording.path(), "evidence/motion/loops.webm");
await recordingBrowser.close();
const metadata = await sharp("public/assets/kyoto-expressions.webp", {
  animated: true,
}).metadata();
assert.equal(errors.length, 0);
const results = {
  url,
  date: new Date().toISOString(),
  errors,
  checks: [
    "Tour completes all three views and wraps",
    "Gallery playback buttons removed",
    "Manual selection stops autoplay",
    "Hover suspends tour",
    "Offscreen tour suspends",
    "Companion pause and resume",
    "All six selected portraits load genuine expression loops; portrait pause/resume and reduced motion",
    "All 20 standalone decorative orbs load expression loops; shared pause stops all character animation",
    "Real browser pixel changes confirm hero and team-group expressions",
    "Dynamic reduced motion stops both loops",
    "Real-time browser expression change and return to rest",
    "Real-time browser tour advances",
  ],
  companion: {
    pages: metadata.pages,
    duration: metadata.delay.reduce((a, b) => a + b, 0),
    bytes: (await fs.stat("public/assets/kyoto-expressions.webp")).size,
  },
};
await fs.writeFile(
  "evidence/motion/verification.json",
  JSON.stringify(results, null, 2) + "\n",
);
console.log(JSON.stringify(results, null, 2));
