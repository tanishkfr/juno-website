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
const duration = 12000;
const records = {};
for (const [id, recipe] of Object.entries(CHARACTER_ORB_RECIPES)) {
  // An authored character-expression preview using the product's actual face
  // parts. It does not represent task completion or any runtime activity.
  const schedule = [
    { at: 0, frame: {} },
    { at: 1400, frame: { eyes: "closed" } },
    { at: 1550, frame: {} },
    {
      at: 3000,
      frame: {
        eyes: "happy",
        mouth: recipe.mouth === "smirk" ? "smirk" : "grin",
      },
    },
    { at: 4400, frame: {} },
    {
      at: 7200,
      frame: {
        eyes:
          id === "prague" || id === "new-york" ? "glance-right" : "glance-left",
      },
    },
    { at: 7800, frame: {} },
    { at: 10000, frame: { eyes: "closed" } },
    { at: 10150, frame: {} },
  ];
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
    .toFile(`public/assets/${id}-expressions.webp`);
  const metadata = await sharp(`public/assets/${id}-expressions.webp`, {
    animated: true,
  }).metadata();
  records[id] = {
    source:
      "UI-overhaul 86b0f418: canonical recipe, expression face parts and renderOrbRgba",
    presentation:
      "Authored blink, smile and glance loop; no runtime activity implied",
    duration,
    crop,
    frames: schedule,
    pages: metadata.pages,
    delays: metadata.delay,
  };
  console.log({
    id,
    pages: metadata.pages,
    delays: metadata.delay,
    bytes: (await fs.stat(`public/assets/${id}-expressions.webp`)).size,
  });
}
await fs.writeFile(
  "source-assets/expressions.json",
  JSON.stringify(records, null, 2) + "\n",
);
