/**
 * Målrettet visuell nettleserkontroll av illustrasjonssystemet (#23).
 * Kjør lokalt med: npm install --no-save playwright && npx playwright install chromium
 * Start server: python3 -m http.server 8765
 * Deretter: node tools/check-illustration-browser.mjs
 */
import fs from "node:fs";
import { chromium } from "playwright";

const base = "http://127.0.0.1:8765/Paradispartiet/";
const cases = [
  ["index.html", ".vision-home-image"],
  ["politikk.html", ".vision-page-image"],
  ["prosjekter.html", ".vision-page-image"],
  ["Prosjekter/BilfriBy.html", ".vision-banner-image"],
  ["manifest.html", ".vision-page-image"],
  ["404.html", ".vision-page-image"]
];
const devices = [
  ["mobile", { width: 390, height: 844 }],
  ["ipad", { width: 820, height: 1180 }],
  ["desktop", { width: 1440, height: 900 }]
];
const errors = [];
fs.mkdirSync("illustration-screenshots", { recursive: true });
const browser = await chromium.launch({ headless: true });
try {
  for (const [name, viewport] of devices) {
    const page = await browser.newPage({ viewport, deviceScaleFactor: 1 });
    await page.route(/^https?:\/\/(?!127\.0\.0\.1:8765)/, route => route.abort());
    for (const [url, selector] of cases) {
      const full = base + url;
      const response = await page.goto(full, { waitUntil: "domcontentloaded", timeout: 30000 });
      if (!response?.ok()) { errors.push(name + " " + url + ": HTTP " + response?.status()); continue; }
      let visible;
      try {
        await page.locator(selector).first().waitFor({ state: "visible", timeout: 10000 });
        visible = await page.locator(selector).first().evaluate(async img => {
          if (!img.complete) await img.decode();
          return {
            width: img.naturalWidth,
            height: img.naturalHeight,
            src: img.currentSrc,
            box: img.getBoundingClientRect().toJSON()
          };
        });
      } catch(e) {
        errors.push(name + " " + url + ": motivbildet lastes ikke: " + e.message.slice(0,100));
        continue;
      }
      if (!visible.width || !visible.height) errors.push(name + " " + url + ": bilde uten pikseldata");
      // Vent på at den avkodede bildeflaten også er tegnet av nettleseren.
      await page.evaluate(async () => {
        const onscreen = [...document.querySelectorAll("img.vision-card-art, img.vision-topic-art")]
          .filter(img => {
            const rect = img.getBoundingClientRect();
            return rect.top < innerHeight && rect.bottom > 0;
          });
        await Promise.all(onscreen.map(img => img.decode().catch(() => {})));
        await new Promise(resolve => requestAnimationFrame(() => requestAnimationFrame(resolve)));
      });
      const metrics = await page.evaluate(() => ({
        viewport: window.innerWidth,
        content: document.documentElement.scrollWidth,
        height: document.documentElement.scrollHeight
      }));
      if (metrics.content > metrics.viewport + 3)
        errors.push(name + " " + url + ": horisontal overscroll " + (metrics.content - metrics.viewport) + "px");
      if (["index.html","politikk.html","Prosjekter/BilfriBy.html"].includes(url)) {
        await page.screenshot({
          path: "illustration-screenshots/" + name + "-" + url.replaceAll("/", "-").replace(".html", "") + ".png",
          fullPage: false
        });
      }
      console.log(name, url, "illustrasjon", visible.width + "x" + visible.height,
        "viewport", metrics.viewport, "content", metrics.content);
    }
    await page.close();
  }
} finally {
  await browser.close();
}
if (errors.length) {
  console.error("Visuell kontroll feilet:\n" + errors.map(e=>" - "+e).join("\n"));
  process.exitCode = 1;
} else {
  console.log("OK: Illustrasjoner lastes uten horisontal overscroll på mobil, iPad og desktop.");
}
