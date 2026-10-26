import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { createHash } from "node:crypto";

const origin = new URL(process.env.WEBSITE_URL);
assert.equal(origin.protocol, "https:");
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
async function filesAt(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true });
  const files = await Promise.all(
    entries.map((entry) => {
      const file = path.join(directory, entry.name);
      return entry.isDirectory() ? filesAt(file) : [file];
    }),
  );
  return files.flat();
}
const files = await filesAt("dist");
const results = {
  url: origin.href,
  date: new Date().toISOString(),
  files: [],
  privatePaths: [],
};
// No cookies, authorization headers or protection bypass: these are the public
// bytes a new visitor receives, compared with this checkout's production build.
for (let start = 0; start < files.length; start += 6) {
  await Promise.all(
    files.slice(start, start + 6).map(async (file) => {
      const relative = path.relative("dist", file).replaceAll(path.sep, "/");
      const url = new URL(relative === "index.html" ? "" : relative, origin);
      const response = await fetch(url, { signal: AbortSignal.timeout(30000) });
      assert.equal(response.status, 200, url.href);
      assert.equal(response.url, url.href);
      assert.equal(response.headers.get("x-content-type-options"), "nosniff");
      assert.equal(
        response.headers.get("referrer-policy"),
        "strict-origin-when-cross-origin",
      );
      const bytes = Buffer.from(await response.arrayBuffer());
      assert.equal(
        digest(bytes),
        digest(await fs.readFile(file)),
        `Deployed bytes differ: ${relative}`,
      );
      if (relative === "index.html") {
        const html = bytes.toString("utf8");
        assert(html.includes('rel="canonical" href="' + origin.href + '"'));
        assert(
          html.includes(
            'property="og:image" content="' +
              new URL("assets/juno-social.png", origin).href +
              '"',
          ),
        );
      }
      results.files.push({
        path: relative,
        status: response.status,
        bytes: bytes.length,
        sha256: digest(bytes),
        contentType: response.headers.get("content-type"),
      });
    }),
  );
}
for (const privatePath of [
  "/.git/config",
  "/.env",
  "/source-assets/companions.json",
  "/source-assets/workflow-demo.json",
  "/source-assets/workflow-recording.webm",
  "/scripts/record-workflow.mjs",
  "/HANDOFF.md",
]) {
  const response = await fetch(new URL(privatePath, origin), {
    signal: AbortSignal.timeout(30000),
  });
  assert.equal(
    response.status,
    404,
    `Non-public source unexpectedly served: ${privatePath}`,
  );
  results.privatePaths.push({ path: privatePath, status: response.status });
}
results.files.sort((a, b) => a.path.localeCompare(b.path));
await fs.writeFile(
  "evidence/deployment-http.json",
  JSON.stringify(results, null, 2) + "\n",
);
console.log(
  JSON.stringify(
    {
      url: results.url,
      filesMatchingLocalBuild: results.files.length,
      privatePathsNotExposed: results.privatePaths.length,
    },
    null,
    2,
  ),
);
