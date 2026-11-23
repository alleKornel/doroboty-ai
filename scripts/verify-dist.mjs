import { strict as assert } from "node:assert";
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join } from "node:path";

const publicFiles = new Set(readdirSync("public"));
const allowedRoots = new Set(["index.html", "assets", ...publicFiles]);
const staged = readdirSync("dist");
assert.ok(
  staged.every((name) => allowedRoots.has(name)),
  "Unexpected content in dist",
);
assert.ok(staged.includes("assets"), "The build must contain compiled assets");
assert.deepEqual(readdirSync("dist/case"), ["baseline.csv"], "Only the baseline data is shipped");
assert.deepEqual(readFileSync("dist/case/baseline.csv"), readFileSync("public/case/baseline.csv"));

const index = readFileSync("dist/index.html", "utf8");
assert.match(index, /<meta name="robots" content="noindex, nofollow"/);
const assetReferences = [...index.matchAll(/(?:src|href)="(\.\/assets\/[^"]+)"/g)];
assert.ok(
  assetReferences.some(([, url]) => url.endsWith(".js")),
  "Missing relative JS entry",
);
assert.ok(
  assetReferences.some(([, url]) => url.endsWith(".css")),
  "Missing relative CSS entry",
);
for (const [, url] of assetReferences) assert.ok(statSync(join("dist", url)).isFile(), url);

console.log("Static build checked: relative entry assets and baseline-only teaching data.");
