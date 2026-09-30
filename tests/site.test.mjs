import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { dirname, resolve } from "node:path";
const pages = [
  "index.html",
  "support.html",
  "privacy.html",
  "terms.html",
  "404.html",
];
const home = readFileSync("index.html", "utf8");
test("Every local page link, fragment, and asset resolves", () => {
  for (const page of pages) {
    const html = readFileSync(page, "utf8");
    for (const [, url] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
      if (/^(https?:|mailto:|data:)/.test(url)) continue;
      const [file, fragment] = url.split("#");
      const target = resolve(dirname(page), file || page);
      assert.ok(existsSync(target), `${page}: missing ${url}`);
      if (fragment)
        assert.ok(
          readFileSync(target, "utf8").includes(`id="${fragment}"`),
          `${page}: missing fragment ${url}`,
        );
    }
  }
});
test("Both apps have distinct metadata and truthful download availability", () => {
  const data = JSON.parse(
    home.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1],
  );
  const apps = data["@graph"].filter(
    (entry) => entry["@type"] === "MobileApplication",
  );
  assert.equal(apps.length, 2);
  assert.equal(
    apps[0].downloadUrl,
    "https://apps.apple.com/app/songduel/id6800088510",
  );
  assert.equal(apps[1].downloadUrl, undefined);
  assert.match(apps[1].description, /Coming soon/);
  const ring = home.slice(
    home.indexOf('id="own-the-ring"'),
    home.indexOf('id="faq"'),
  );
  assert.doesNotMatch(ring, /apps\.apple\.com/);
});
test("Homepage images have explicit dimensions and accessible alternatives", () => {
  for (const [img] of home.matchAll(/<img\b[^>]*>/g)) {
    for (const attr of ["alt", "width", "height"])
      assert.match(img, new RegExp(`${attr}="[^"]*"`));
  }
});
test("Structured content has unique anchors and one main heading", () => {
  const ids = [...home.matchAll(/\bid="([^"]+)"/g)].map((m) => m[1]);
  assert.equal(new Set(ids).size, ids.length);
  assert.equal([...home.matchAll(/<h1\b/g)].length, 1);
});
