// One-time asset export from the disposable, read-only product source copy.
// Run: node --experimental-strip-types scripts/export-motion.mjs
import fs from "node:fs/promises";
import { pathToFileURL } from "node:url";
import path from "node:path";
import sharp from "sharp";

const source = path.resolve("../juno-website-studio");
const load = (file) => import(pathToFileURL(path.join(source, file)).href);
const { renderOrbRgba } = await load("src/product/orbs/orb-raster.ts");
const { CHARACTER_ORB_RECIPES } = await load("src/product/orbs/orb-recipes.ts");
const { orbFrameSchedule } = await load("src/product/orbs/orb-motion.ts");
const recipe = CHARACTER_ORB_RECIPES.kyoto;
const duration = 14000;
const schedule = orbFrameSchedule(
  { recipe, state: "idle", seed: "kyoto" },
  0,
  duration,
  50,
);
// Keep the entire loop on one fixed canvas. Trimming each expression separately
// would make the character jump between frames.
const frames = schedule.map(({ frame }) =>
  Buffer.from(renderOrbRgba(recipe, frame, 576)),
);
const still = frames[0];
let left = 576,
  top = 576,
  right = 0,
  bottom = 0;
for (let y = 0; y < 576; y++) {
  for (let x = 0; x < 576; x++) {
    if (still[(y * 576 + x) * 4 + 3]) {
      left = Math.min(left, x);
      top = Math.min(top, y);
      right = Math.max(right, x);
      bottom = Math.max(bottom, y);
    }
  }
}
const crop = { left, top, width: right - left + 1, height: bottom - top + 1 };
const cropped = await Promise.all(
  frames.map((frame) =>
    sharp(frame, { raw: { width: 576, height: 576, channels: 4 } })
      .extract(crop)
      .raw()
      .toBuffer(),
  ),
);
const delays = schedule.map(
  (step, i) => (schedule[i + 1]?.at ?? duration) - step.at,
);
await sharp(Buffer.concat(cropped), {
  raw: {
    width: crop.width,
    height: crop.height * frames.length,
    channels: 4,
    pageHeight: crop.height,
  },
})
  .webp({ lossless: true, loop: 0, delay: delays, effort: 6 })
  .toFile("public/assets/kyoto-idle.webp");
const metadata = await sharp("public/assets/kyoto-idle.webp", {
  animated: true,
}).metadata();
await fs.writeFile(
  "source-assets/kyoto-idle.json",
  JSON.stringify(
    {
      source: "UI-overhaul 86b0f418: orbFrameSchedule + renderOrbRgba",
      state: "idle",
      seed: "kyoto",
      duration,
      crop,
      frames: schedule,
      pages: metadata.pages,
      delays: metadata.delay,
    },
    null,
    2,
  ) + "\n",
);
console.log({
  pages: metadata.pages,
  delays: metadata.delay,
  bytes: (await fs.stat("public/assets/kyoto-idle.webp")).size,
});
