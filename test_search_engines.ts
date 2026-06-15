import { chromium } from "playwright";

async function testSearchEngines() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent: "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
    viewport: { width: 1280, height: 800 }
  });
  const page = await context.newPage();

  // Test DuckDuckGo Lite
  const ddgUrl = "https://lite.duckduckgo.com/lite/?q=dentists+in+new+york+directory";
  console.log(`\n--- Testing DuckDuckGo Lite: ${ddgUrl} ---`);
  try {
    const response = await page.goto(ddgUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    console.log(`Status: ${response?.status()}`);
    const html = await page.content();
    console.log(`HTML length: ${html.length}`);
    
    const results = await page.$$eval("td.result-link a", els => els.map(el => ({
      href: el.getAttribute("href") || "",
      text: el.textContent?.trim() || ""
    })));
    console.log(`Found ${results.length} DDG Lite links`);
    console.log("Sample results:", results.slice(0, 5));
  } catch (err) {
    console.error("DDG Lite failed:", err);
  }

  // Test Brave Search
  const braveUrl = "https://search.brave.com/search?q=dentists+in+new+york+directory";
  console.log(`\n--- Testing Brave Search: ${braveUrl} ---`);
  try {
    const response = await page.goto(braveUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    console.log(`Status: ${response?.status()}`);
    
    // Let's print out some elements to see the structure
    const results = await page.$$eval("a", els => els.map(el => ({
      href: el.getAttribute("href") || "",
      text: el.textContent?.trim() || "",
      class: el.getAttribute("class") || ""
    })).filter(l => l.href.startsWith("http") && !l.href.includes("brave.com")));
    
    console.log(`Found ${results.length} external links on Brave Search`);
    console.log("Sample Brave results:", results.slice(0, 10));
  } catch (err) {
    console.error("Brave Search failed:", err);
  }

  // Test Startpage
  const startpageUrl = "https://www.startpage.com/sp/search?q=dentists+in+new+york+directory";
  console.log(`\n--- Testing Startpage: ${startpageUrl} ---`);
  try {
    const response = await page.goto(startpageUrl, { waitUntil: "domcontentloaded", timeout: 20000 });
    console.log(`Status: ${response?.status()}`);
    
    const results = await page.$$eval("a", els => els.map(el => ({
      href: el.getAttribute("href") || "",
      text: el.textContent?.trim() || ""
    })).filter(l => l.href.startsWith("http") && !l.href.includes("startpage.com")));
    
    console.log(`Found ${results.length} external links on Startpage`);
    console.log("Sample Startpage results:", results.slice(0, 10));
  } catch (err) {
    console.error("Startpage failed:", err);
  }

  await browser.close();
}

testSearchEngines();
