import { cp, mkdir, rm } from "node:fs/promises";
export const productionFiles = [
  "index.html",
  "privacy.html",
  "terms.html",
  "support.html",
  "404.html",
  "styles.css",
  "products.css",
  "script.js",
  "assets",
  "CNAME",
  ".nojekyll",
  "robots.txt",
  "sitemap.xml",
  "site.webmanifest",
];
await rm("dist", { recursive: true, force: true });
await mkdir("dist");
for (const file of productionFiles)
  await cp(file, `dist/${file}`, { recursive: true });
console.log(
  "Static production site assembled in dist/. GitHub Pages root deployment remains unchanged.",
);
