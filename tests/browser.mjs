import { chromium } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
const browser = await chromium.launch({ channel: "chrome" });
const origin = process.env.SITE_URL || "http://127.0.0.1:8080";
await mkdir("test-results", { recursive: true });
try {
  for (const width of [320, 390, 768, 1024, 1440, 1920]) {
    const context = await browser.newContext({
      viewport: { width, height: 1000 },
    });
    const page = await context.newPage();
    const errors = [];
    page.on("pageerror", (error) => errors.push(error.message));
    await page.goto(origin);
    await page.locator("#own-the-ring").scrollIntoViewIfNeeded();
    await page.waitForTimeout(850);
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth > innerWidth,
      ),
      false,
      `Overflow at ${width}`,
    );
    const accessibility = await new AxeBuilder({ page })
      .withTags(["wcag2a", "wcag2aa", "wcag21aa"])
      .analyze();
    assert.deepEqual(
      accessibility.violations.map((v) => ({
        id: v.id,
        nodes: v.nodes.map((n) => n.target),
      })),
      [],
      `Accessibility at ${width}`,
    );
    await page.evaluate(async () => {
      for (const section of document.querySelectorAll("[data-reveal]")) {
        section.scrollIntoView({ behavior: "instant", block: "center" });
        await new Promise((resolve) => setTimeout(resolve, 40));
      }
      window.scrollTo({ top: 0, behavior: "instant" });
    });
    await page.waitForTimeout(800);
    await page.screenshot({
      path: `test-results/home-${width}.png`,
      fullPage: true,
    });
    if (width < 821) {
      await page.locator("[data-menu-toggle]").click();
      await page.locator("#site-nav a").first().waitFor({ state: "visible" });
      assert.ok(
        (await page.locator("#site-nav").boundingBox()).height >= 1000,
        "Mobile menu fills viewport after scrolling",
      );
      await page.locator("#site-nav a").first().focus();
      await page.keyboard.press("Escape");
      assert.equal(
        await page.locator("[data-menu-toggle]").getAttribute("aria-expanded"),
        "false",
      );
      assert.equal(
        await page
          .locator("[data-menu-toggle]")
          .evaluate((el) => el === document.activeElement),
        true,
      );
      await page.locator("[data-menu-toggle]").click();
      await page.locator("#site-nav a").last().waitFor({ state: "visible" });
      await page.locator("#site-nav a").last().focus();
      await page.keyboard.press("Tab");
      assert.equal(
        await page
          .locator("[data-menu-toggle]")
          .evaluate((el) => el === document.activeElement),
        true,
      );
      await page.locator('#site-nav a[href="#rank-your-music"]').click();
      assert.equal(
        await page.locator("[data-menu-toggle]").getAttribute("aria-expanded"),
        "false",
      );
    }
    for (const product of ["rank-your-music", "own-the-ring"]) {
      await page.locator(`.product-switch a[href="#${product}"]`).click();
      await page.waitForTimeout(1100);
      assert.equal(new URL(page.url()).hash, `#${product}`);
      assert.equal(
        await page
          .locator(`.product-switch a[href="#${product}"]`)
          .getAttribute("aria-current"),
        "location",
      );
      const box = await page.locator(`#${product}`).boundingBox();
      assert.ok(
        box.y >= 110 && box.y <= 160,
        `Product heading visible below sticky navigation: ${box.y}`,
      );
    }
    assert.deepEqual(errors, []);
    await page.close();
    console.log(`PASS: ${width}px layout, accessibility, navigation, console`);
  }
  const page = await browser.newPage({
    reducedMotion: "reduce",
    viewport: { width: 390, height: 844 },
  });
  await page.goto(origin);
  assert.equal(await page.locator("[data-motion-toggle]").isDisabled(), true);
  assert.equal(
    await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length,
    ),
    0,
  );
  await page.emulateMedia({ reducedMotion: "no-preference" });
  await page.locator("[data-motion-toggle]").click();
  assert.equal(
    await page.evaluate(
      () =>
        document.getAnimations().filter((a) => a.playState === "running")
          .length,
    ),
    0,
  );
  await page.locator("[data-motion-toggle]").click();
  assert.ok(
    await page.evaluate(() =>
      document.getAnimations().some((a) => a.playState === "running"),
    ),
  );
  await page.locator('label[for="feedback-follow-up"]').click();
  assert.equal(
    await page.locator("[data-feedback-follow-up]").isChecked(),
    true,
  );
  assert.equal(await page.locator("[data-feedback-email]").isVisible(), true);
  await page
    .locator("[data-feedback-message]")
    .fill("Please add more music discovery options.");
  assert.equal(await page.locator("[data-feedback-count]").innerText(), "40");
  await page.locator("[data-feedback-follow-up]").focus();
  await page.keyboard.press("Space");
  assert.equal(
    await page.locator("[data-feedback-follow-up]").isChecked(),
    false,
  );
  for (const path of ["support.html", "privacy.html", "terms.html"]) {
    await page.goto(`${origin}/${path}`);
    assert.equal(await page.locator("main").count(), 1);
  }
  await page.close();
  const noScript = await browser.newPage({ javaScriptEnabled: false });
  await noScript.goto(origin);
  assert.equal(
    await noScript
      .locator("#rank-title")
      .evaluate((el) => getComputedStyle(el.closest("[data-reveal]")).opacity),
    "1",
  );
  await noScript.close();
  console.log(
    "PASS: reduced motion, manual pause, feedback, legal routes, and no-JavaScript content",
  );
} finally {
  await browser.close();
}
