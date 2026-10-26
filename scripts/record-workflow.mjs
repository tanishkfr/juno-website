// Record a real UI send and live provider reply in the owned demo fixture.
import fs from "node:fs/promises";
import path from "node:path";
import assert from "node:assert/strict";
import { chromium } from "playwright";

const fixture = JSON.parse(
  await fs.readFile("../juno-website-studio/live-demo.json", "utf8"),
);
assert(fixture.dataDir.includes("juno-website-live-demo-"));
assert(new URL(fixture.url).hostname === "127.0.0.1");
const get = async (route) => fetch(fixture.url + route).then((r) => r.json());
const bot = (await get("/api/bots")).bots.find((b) => b.id === "juno-kyoto");
assert.equal(bot.modelSelection.instanceId, "codex");
const prompt =
  "Help me plan a Saturday bookshop pop-up. Give me three practical first steps, under 60 words total.";
await fs.mkdir("source-assets/workflow-capture", { recursive: true });
const browser = await chromium.launch({ channel: "chrome", headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 1000 },
  recordVideo: {
    dir: "source-assets/workflow-capture",
    size: { width: 1440, height: 1000 },
  },
});
const origin = Date.now();
const page = await context.newPage();
const recording = page.video();
const errors = [];
page.on("pageerror", (e) => errors.push(e.message));
try {
  await page.goto(fixture.preview);
  await page.evaluate(() => document.fonts.ready);
  await page.getByLabel("Message Kyoto", { exact: true }).fill(" ");
  await page.waitForFunction(() => !document.querySelector(".runtime-note"), undefined, {
    timeout: 60000,
  });
  await page.getByLabel("Message Kyoto", { exact: true }).fill("");
  const captureStart = Date.now();
  await page.waitForTimeout(500);
  await page
    .getByLabel("Message Kyoto", { exact: true })
    .pressSequentially(prompt, { delay: 24 });
  await page.waitForTimeout(500);
  const sentAt = Date.now();
  await page.getByRole("button", { name: "Send message", exact: true }).click();
  console.log(
    "LIVE_REQUEST_SENT",
    JSON.stringify({ bot: bot.id, model: bot.modelSelection.model }),
  );
  let reply;
  const deadline = Date.now() + 120000;
  while (Date.now() < deadline) {
    await page.waitForTimeout(500);
    const messages = await get(`/api/threads/${bot.threadId}/messages`);
    const rows = messages.messages ?? [];
    const candidate = rows
      .filter(
        (m) => m.role === "bot" && m.kind === "text" && m.at >= sentAt - 500,
      )
      .at(-1);
    const current = (await get("/api/bots")).bots.find((b) => b.id === bot.id);
    if (candidate?.text?.trim() && !current.busy) {
      reply = candidate;
      break;
    }
  }
  assert(
    reply,
    "The real provider did not complete a reply within the demo limit",
  );
  assert(
    !/authentication failed|provider unavailable|usage limit reached/i.test(
      reply.text,
    ),
  );
  await page.waitForTimeout(1000);
  await page.screenshot({ path: "source-assets/workflow-result.png" });
  await page.waitForTimeout(4500);
  const end = Date.now();
  await fs.writeFile(
    "source-assets/workflow-demo.json",
    JSON.stringify(
      {
        recordedAt: new Date().toISOString(),
        source:
          "Real Juno renderer, UI-overhaul 86b0f418, isolated server and fresh browser profile",
        provider: "Authenticated Codex CLI through Juno",
        model: bot.modelSelection.model,
        prompt,
        response: reply.text,
        threadId: bot.threadId,
        replyId: reply.id,
        startSeconds: (captureStart - origin) / 1000,
        sentSeconds: (sentAt - origin) / 1000,
        endSeconds: (end - origin) / 1000,
        elapsedSeconds: (end - captureStart) / 1000,
        errors,
        qualification:
          "Genuine provider response. No seeded messages, fake engines, scripted reply text, or fabricated tool execution. Only the initial loading period may be trimmed.",
      },
      null,
      2,
    ) + "\n",
  );
  console.log(
    "LIVE_REPLY_COMPLETE",
    JSON.stringify({
      text: reply.text,
      elapsedSeconds: (end - captureStart) / 1000,
      errors,
    }),
  );
} finally {
  await context.close();
  await fs.rename(
    await recording.path(),
    path.resolve("source-assets/workflow-recording.webm"),
  );
  await browser.close();
}
