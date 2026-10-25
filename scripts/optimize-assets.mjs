import fs from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
const root = path.resolve("source-assets");
const files = (await fs.readdir(root)).filter((f) => f.endsWith(".png"));
for (const name of files) {
  const base = name.slice(0, -4);
  const source = path.join(root, name);
  // Presentation crops keep the relevant real controls legible. Full-view
  // assets below preserve every pixel of the untouched source screenshot.
  const crop =
    base === "computer-control"
      ? { left: 1086, top: 535, width: 335, height: 360 }
      : base === "research"
        ? { left: 850, top: 690, width: 500, height: 310 }
        : base === "library"
          ? { left: 1064, top: 32, width: 376, height: 300 }
          : undefined;
  for (const width of [960, 1440])
    await (crop ? sharp(source).extract(crop) : sharp(source))
      .resize({ width, withoutEnlargement: true })
      .webp({ quality: 86, effort: 6 })
      .toFile(`public/assets/${base}-${width}.webp`);
  await sharp(source)
    .webp({ quality: 94, effort: 6 })
    .toFile(`public/assets/${base}-full.webp`);
}
const bg = Buffer.from(
  `<svg width="1200" height="630"><rect width="1200" height="630" fill="#f3f3ef"/><text x="600" y="204" text-anchor="middle" font-family="sans-serif" font-size="92" font-weight="500" fill="#202623">Meet Juno.</text><text x="600" y="270" text-anchor="middle" font-family="sans-serif" font-size="26" fill="#59625b">Good work, in good company.</text><text x="600" y="566" text-anchor="middle" font-family="sans-serif" font-size="20" fill="#59625b">An AI desktop workspace for Windows · Private beta</text></svg>`,
);
const cast = ["lisbon", "toronto", "kyoto", "prague", "seoul", "new-york"];
const layers = await Promise.all(
  cast.map(async (id, i) => ({
    input: await sharp(`public/assets/${id}.png`)
      .resize({ width: 120, height: 130, fit: "inside", kernel: "nearest" })
      .png()
      .toBuffer(),
    left: 100 + i * 172,
    top: 340,
  })),
);
await sharp(bg).composite(layers).png().toFile("public/assets/juno-social.png");
console.log(`Optimized ${files.length} real captures and the social preview.`);
