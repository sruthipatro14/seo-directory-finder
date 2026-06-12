// crawler/browserPool.ts
// Manages a single shared Chromium Browser instance.
// Reusing one browser across multiple crawls avoids the overhead of
// launching and tearing down a new process for every URL.

import { chromium, Browser } from "playwright";
import { defaultCrawlerConfig } from "./crawler.config";

let _browser: Browser | null = null;

/**
 * Returns the shared Browser, launching it if it isn't running yet.
 * Safe to call multiple times — reuses the existing instance.
 */
export async function getBrowser(): Promise<Browser> {
  if (!_browser || !_browser.isConnected()) {
    _browser = await chromium.launch({
      headless: defaultCrawlerConfig.headless,
    });
  }
  return _browser;
}

/**
 * Closes the shared Browser and clears the cached instance.
 * Call this when your process is done crawling (e.g. end of a batch job).
 */
export async function closeBrowser(): Promise<void> {
  if (_browser) {
    await _browser.close();
    _browser = null;
  }
}
