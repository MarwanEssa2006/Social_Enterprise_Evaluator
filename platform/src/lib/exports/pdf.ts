import "server-only";
import { chromium } from "playwright";

// TD-20: headless Chromium renders the report HTML (correct Arabic shaping and RTL).
export async function htmlToPdf(html: string): Promise<Buffer> {
  const browser = await chromium.launch({ args: ["--disable-dev-shm-usage"] });
  try {
    const context = await browser.newContext({ javaScriptEnabled: false });
    const page = await context.newPage();
    await page.route("**/*", (route) => route.abort()); // no network access while rendering
    await page.setContent(html, { waitUntil: "load" });
    const pdf = await page.pdf({ format: "A4", printBackground: true, preferCSSPageSize: true });
    return Buffer.from(pdf);
  } finally {
    await browser.close();
  }
}
