import { chromium } from "playwright";

async function test() {
  console.log("Launching browser...");
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  const url = "https://www.yellowpages.com/search?search_terms=dentists&geo_location_terms=United+States";
  console.log(`Navigating to ${url}...`);
  try {
    const response = await page.goto(url, { waitUntil: "domcontentloaded", timeout: 20000 });
    console.log(`Response status: ${response?.status()}`);
    const title = await page.title();
    console.log(`Page title: ${title}`);
    
    // Extract external links
    const links = await page.$$eval("a", els => els.map(el => {
      return {
        href: el.getAttribute("href") || "",
        text: el.textContent?.trim() || ""
      };
    }));
    console.log(`Found ${links.length} links`);
    const external = links.filter(l => l.href.startsWith("http") && !l.href.includes("yellowpages.com"));
    console.log("Sample external links:", external.slice(0, 10));
  } catch (err) {
    console.error("Navigation failed:", err);
  } finally {
    await browser.close();
  }
}

test();
