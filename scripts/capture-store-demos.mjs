import { chromium } from "playwright";
import { mkdir } from "fs/promises";
import path from "path";

const outDir = path.resolve("public/landing");

const targets = [
  {
    name: "everlane",
    file: "store-demo-1.png",
    url: "https://www.everlane.com/",
  },
  {
    name: "uniqlo",
    file: "store-demo-2.png",
    url: "https://www.uniqlo.com/us/en/",
  },
  {
    name: "allbirds",
    file: "store-demo-3.png",
    url: "https://www.allbirds.com/",
  },
];

async function dismissOverlays(page) {
  const selectors = [
    'button:has-text("No Thanks")',
    'button:has-text("No thanks")',
    'button:has-text("Accept")',
    'button:has-text("Accept All")',
    'button:has-text("Accept all")',
    'button:has-text("I Agree")',
    'button:has-text("Got it")',
    'button:has-text("Close")',
    '[aria-label="Close"]',
    '[aria-label="close"]',
    'button[aria-label="Close dialog"]',
  ];
  for (const sel of selectors) {
    try {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 800 })) {
        await el.click({ timeout: 1000 }).catch(() => {});
        await page.waitForTimeout(400);
      }
    } catch {
      /* ignore */
    }
  }
  await page.keyboard.press("Escape").catch(() => {});
}

async function main() {
  await mkdir(outDir, { recursive: true });
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
    locale: "en-US",
  });

  for (const t of targets) {
    const page = await context.newPage();
    console.log(`Capturing ${t.name} → ${t.file}`);
    try {
      await page.goto(t.url, { waitUntil: "domcontentloaded", timeout: 60000 });
      await page.waitForTimeout(3500);
      await dismissOverlays(page);
      await page.waitForTimeout(800);
      await dismissOverlays(page);
      const out = path.join(outDir, t.file);
      await page.screenshot({ path: out, fullPage: false });
      console.log(`OK ${t.name}`);
    } catch (err) {
      console.error(`FAIL ${t.name}:`, err.message);
    } finally {
      await page.close();
    }
  }

  await browser.close();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
