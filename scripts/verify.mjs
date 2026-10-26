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
    module: document
      .querySelector('script[type="module"][src]')
      ?.getAttribute("src"),
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
for (const name of ["Workspace", "Code", "Conversation"]) {
  await page.getByRole("tab", { name, exact: true }).click();
  await page.locator(".hero-shot img").evaluate((i) => i.decode());
  if (
    (await page
      .getByRole("tab", { name, exact: true })
      .getAttribute("aria-selected")) !== "true"
  )
    throw new Error("Product preview tab failed");
}
await page.getByRole("tab", { name: "Conversation", exact: true }).focus();
await page.keyboard.press("ArrowRight");
if (
  new Set(results.viewports.map((v) => v.module)).size !== 1 ||
  (await page
    .getByRole("tab", { name: "Workspace", exact: true })
    .getAttribute("aria-selected")) !== "true"
)
  throw new Error("Product preview keyboard navigation failed");
await page.getByRole("tab", { name: "Conversation", exact: true }).click();
results.interactions.push(
  "All three genuine product previews, with arrow-key tab selection",
);
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
await page.waitForFunction(
  () =>
    document
      .querySelector('.desktop-nav a[href="#companions"]')
      ?.getAttribute("aria-current") === "location",
);
results.interactions.push(
  "Navigation identifies the current section while scrolling",
);
await page.locator(".hero-shot").click();
await page.locator("#dialog-image").evaluate((i) => i.decode());
await page.getByRole("button", { name: "Actual size", exact: true }).click();
const zoom = await page
  .locator("#image-viewport")
  .evaluate((e) => ({ scroll: e.scrollWidth, client: e.clientWidth }));
if (zoom.scroll <= zoom.client)
  throw new Error("Actual-size image did not become scrollable on mobile");
await page.screenshot({ path: "evidence/mobile-actual-size.png" });
await page.getByRole("button", { name: "Fit to view", exact: true }).click();
if (
  (await page.locator("#image-size").getAttribute("aria-pressed")) !== "false"
)
  throw new Error("Fit view did not restore");
await page.keyboard.press("Escape");
results.interactions.push(
  "Actual-size mobile image inspection and fit-view restoration",
);
await page.route("**/assets/conversation-full.webp", (route) => route.abort());
await page.locator(".hero-shot").click();
await page
  .getByText("This screenshot couldn’t load. Close it and try again.", {
    exact: true,
  })
  .waitFor();
if (!(await page.locator("#image-size").isDisabled()))
  throw new Error("Zoom enabled for failed image");
await page.keyboard.press("Escape");
await page.unroute("**/assets/conversation-full.webp");
results.interactions.push(
  "Failed screenshot has a truthful error state and remains dismissible",
);
const requestLinks = await page
  .locator("[data-beta-request]")
  .evaluateAll((links) => links.map((link) => link.href));
if (requestLinks.length !== 2 || new Set(requestLinks).size !== 1)
  throw new Error("Email request links differ");
const mail = new URL(requestLinks[0]);
if (
  mail.protocol !== "mailto:" ||
  mail.pathname !== "madebytanishk@gmail.com" ||
  mail.searchParams.get("subject") !== "Juno private beta access" ||
  !mail.searchParams.get("body")?.includes("bugs or unfinished features") ||
  !mail.searchParams.get("body")?.includes("Name:")
)
  throw new Error("Prefilled beta email is incomplete");
if (
  !(await page
    .getByText("Juno is currently in private beta.", { exact: true })
    .count())
)
  throw new Error("Private-beta availability statement missing");
results.interactions.push(
  "Header and closing CTA contain the same prefilled beta-request email; private-beta disclosure remains visible",
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
  `No embedded web forms: ${noForms} form elements`,
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
