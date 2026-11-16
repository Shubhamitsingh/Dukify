import { chromium } from "playwright";
import path from "path";

const candidates = [
  { name: "Reformation", url: "https://www.reformation.com/", host: "thereformation.com" },
  { name: "Levi's", url: "https://www.levi.com/", host: "levi.com" },
  { name: "Madewell", url: "https://www.madewell.com/", host: "madewell.com" },
  { name: "H&M", url: "https://www2.hm.com/en_us/index.html", host: "hm.com" },
  { name: "Nike", url: "https://www.nike.com/", host: "nike.com" },
  { name: "Adidas", url: "https://www.adidas.com/us", host: "adidas.com" },
  { name: "Aritzia", url: "https://www.aritzia.com/", host: "aritzia.com" },
  { name: "Quince", url: "https://www.quince.com/", host: "quince.com" },
];

const browser = await chromium.launch({ headless: true });
const context = await browser.newContext({
  viewport: { width: 1440, height: 900 },
  userAgent:
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
  locale: "en-US",
});

let winner = null;

for (const c of candidates) {
  const page = await context.newPage();
  console.log("TRY", c.name, c.url);
  try {
    const res = await page.goto(c.url, { waitUntil: "domcontentloaded", timeout: 45000 });
    await page.waitForTimeout(3200);
    const title = await page.title();
    const body = (await page.locator("body").innerText().catch(() => "")).slice(0, 500);
    if (!res || res.status() >= 400 || /access denied|forbidden|just a moment|attention required/i.test(body)) {
      console.log("BLOCKED", c.name, title);
      await page.close();
      continue;
    }
    for (const sel of [
      'button:has-text("No Thanks")',
      'button:has-text("Accept all")',
      'button:has-text("Accept All")',
      'button:has-text("Accept")',
      'button:has-text("Got it")',
      '[aria-label="Close"]',
    ]) {
      try {
        const el = page.locator(sel).first();
        if (await el.isVisible({ timeout: 600 })) await el.click({ timeout: 800 }).catch(() => {});
      } catch {
        /* ignore */
      }
    }
    await page.keyboard.press("Escape").catch(() => {});
    await page.waitForTimeout(700);
    const out = path.resolve("public/landing/store-demo-2.png");
    await page.screenshot({ path: out, fullPage: false });
    winner = c;
    console.log("OK", c.name, title);
    await page.close();
    break;
  } catch (e) {
    console.log("FAIL", c.name, e.message);
    await page.close();
  }
}

await browser.close();
if (!winner) {
  console.error("No candidate worked");
  process.exit(2);
}
console.log("WINNER", JSON.stringify(winner));
