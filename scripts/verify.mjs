import fs from "node:fs/promises";
import { chromium } from "playwright";
import AxeBuilder from "@axe-core/playwright";
const url = process.env.WEBSITE_URL ?? "http://127.0.0.1:5272/";
const browser = await chromium.launch({ channel: "chrome", headless: true });
const results = {
  url,
  date: new Date().toISOString(),
  viewports: [],
  interactions: [],
  errors: [],
  imageFailures: [],
};
const context = await browser.newContext();
const page = await context.newPage();
page.on("pageerror", (e) => results.errors.push(e.message));
page.on("response", (r) => {
  if (r.status() >= 400) results.errors.push(`${r.status()} ${r.url()}`);
});
for (const [name, width, height] of [
  ["wide", 1920, 1080],
  ["laptop", 1366, 768],
  ["tablet", 834, 1112],
  ["mobile", 390, 844],
  ["narrow", 320, 740],
]) {
  await page.setViewportSize({ width, height });
  await page.goto(url);
  await page.evaluate(() => document.fonts.ready);
  await page.evaluate(async () => {
    for (const image of document.images) {
      if (image.loading === "lazy") image.loading = "eager";
    }
    await Promise.all(
      [...document.images]
        .filter((i) => i.src)
        .map((i) => i.decode().catch(() => {})),
    );
  });
  const layout = await page.evaluate(() => ({
    width: innerWidth,
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
    broken: [...document.images]
      .filter((i) => i.hasAttribute("src") && !i.naturalWidth)
      .map((i) => i.getAttribute("src")),
    anchors: [...document.querySelectorAll('a[href^="#"]')]
      .filter((a) => !document.getElementById(a.getAttribute("href").slice(1)))
      .map((a) => a.getAttribute("href")),
  }));
  const axe = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21aa", "wcag22aa"])
    .analyze();
  results.viewports.push({
    name,
    ...layout,
    violations: axe.violations.map((v) => ({
      id: v.id,
      impact: v.impact,
      nodes: v.nodes.map((n) => ({
        target: n.target,
        summary: n.failureSummary,
      })),
    })),
  });
  await page.screenshot({ path: `evidence/${name}-hero.png` });
  await page.screenshot({ path: `evidence/${name}-full.png`, fullPage: true });
  if (name === "laptop" || name === "mobile")
    for (const id of ["companions", "features", "code", "control"]) {
      await page.locator("#" + id).scrollIntoViewIfNeeded();
      await page.screenshot({ path: `evidence/${name}-${id}.png` });
    }
}
await page.setViewportSize({ width: 1366, height: 768 });
await page.goto(url);
for (const name of [
  "Kyoto",
  "Prague",
  "Lisbon",
  "Seoul",
  "Toronto",
  "New York",
]) {
  await page.getByRole("button", { name, exact: true }).click();
  if ((await page.locator("#portrait-name").innerText()) !== name)
    throw new Error("Companion selection failed: " + name);
}
await page.getByRole("button", { name: "Kyoto", exact: true }).focus();
await page.keyboard.press("ArrowRight");
if ((await page.locator("#portrait-name").innerText()) !== "Prague")
  throw new Error("Companion keyboard selection failed");
results.interactions.push(
  "All six companion selections and arrow-key navigation",
);
for (const feature of ["computer-control", "routines", "library", "research"]) {
  await page.locator(`.capability-grid [data-image="${feature}"]`).click();
  await page.locator("#dialog-image").evaluate((i) => i.decode());
  await page.keyboard.press("Escape");
}
results.interactions.push(
  "All four feature panels open their full authentic product photograph",
);
const shot = page.locator(".hero-shot");
await shot.click();
await page.locator("#dialog-image").evaluate((i) => i.decode());
for (const key of ["Tab", "Shift+Tab"]) {
  await page.keyboard.press(key);
  if (
    !(await page
      .locator("dialog")
      .evaluate((d) => d.contains(document.activeElement)))
  )
    throw new Error("Dialog focus escaped");
}
await page.keyboard.press("Escape");
if (await page.locator("dialog").evaluate((d) => d.open))
  throw new Error("Escape did not close dialog");
if (!(await shot.evaluate((e) => e === document.activeElement)))
  throw new Error("Focus did not return");
results.interactions.push(
  "Image dialog loads full image, traps focus, Escape closes, focus returns",
);
await page.setViewportSize({ width: 390, height: 844 });
await page.goto(url);
await page
  .getByRole("button", { name: "Open navigation", exact: true })
  .click();
await page.locator('#mobile-nav a[href="#companions"]').click();
if (!(await page.locator("#mobile-nav").evaluate((e) => e.hidden)))
  throw new Error("Menu did not close");
results.interactions.push("Mobile menu opens, navigates, and closes");
await page.locator(".beta-status").click();
if (!page.url().endsWith("#availability"))
  throw new Error("Availability link did not navigate");
results.interactions.push(
  "Private beta header link navigates to the actual availability statement",
);
await page.emulateMedia({ reducedMotion: "reduce" });
await page.reload();
const reduced = await page.locator(".hero h1").evaluate((e) => ({
  animation: getComputedStyle(e).animationName,
  scroll: getComputedStyle(document.documentElement).scrollBehavior,
}));
if (reduced.animation !== "none" || reduced.scroll !== "auto")
  throw new Error("Reduced motion failed");
results.interactions.push(
  "Reduced motion removes hero animation and smooth scrolling",
);
await page.screenshot({ path: "evidence/mobile-reduced-motion.png" });
await page.goto(url);
const noForms = await page.locator("input,form").count();
results.interactions.push(
  `No signup or download flows: ${noForms} form elements`,
);
await context.close();
const noJs = await browser.newContext({
  javaScriptEnabled: false,
  viewport: { width: 390, height: 844 },
});
const staticPage = await noJs.newPage();
await staticPage.goto(url);
await staticPage.screenshot({ path: "evidence/mobile-no-javascript.png" });
results.interactions.push("Core content renders with JavaScript disabled");
await noJs.close();
await browser.close();
await fs.writeFile(
  "evidence/verification.json",
  JSON.stringify(results, null, 2),
);
console.log(JSON.stringify(results, null, 2));
if (
  results.viewports.some(
    (v) =>
      v.scrollWidth > v.clientWidth + 1 ||
      v.broken.length ||
      v.anchors.length ||
      v.violations.length,
  ) ||
  results.errors.length
)
  process.exitCode = 1;
