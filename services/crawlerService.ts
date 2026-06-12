// services/crawlerService.ts
//
// Uses Playwright (Chromium) to visit pages and extract SEO data.
//
// Architecture:
//   crawlWebsite(url)          — visits URL, returns title + description + listing signals
//   detectKeywords(text)       — scans visible text + anchors + buttons for listing signals
//   crawlBatch(urls)           — concurrent multi-URL crawl with shared browser

import { defaultCrawlerConfig } from "@/crawler/crawler.config";
import { getBrowser, closeBrowser } from "@/crawler/browserPool";

// ─── Public result types ──────────────────────────────────────────────────────

export interface CrawlResult {
  url: string;
  title: string;
  description: string;
  /** true when ANY listing signal is detected */
  freeListing: boolean;
  /** Labels of every matched signal */
  detectedKeywords: string[];
  crawledAt: Date;
  error?: string;
}

export interface CrawlOptions {
  /** Navigation timeout in milliseconds. Defaults to crawlerConfig value. */
  timeoutMs?: number;
  /** User-agent string. Defaults to crawlerConfig value. */
  userAgent?: string;
}

// ─── Keyword registry ─────────────────────────────────────────────────────────

/**
 * Maps a human-readable signal label to one or more regex patterns.
 * freeListing is set to true when ANY entry matches.
 * Add new signals here — no other code changes needed.
 */
const LISTING_SIGNALS: Record<string, RegExp[]> = {
  "Add Business":          [/add\s+(?:your\s+)?business/i,        /add\s+(?:a\s+)?listing/i],
  "Submit Listing":        [/submit\s+(?:a\s+|your\s+)?listing/i, /submit\s+(?:your\s+)?site/i],
  "Free Listing":          [/free\s+listing/i,                    /list\s+(?:for\s+)?free/i, /free\s+submission/i],
  "Create Profile":        [/create\s+(?:a\s+|your\s+)?(?:business\s+)?profile/i, /set\s+up\s+(?:your\s+)?profile/i],
  "Register Business":     [/register\s+(?:your\s+)?business/i,   /register\s+(?:a\s+)?company/i],
  "Add Company":           [/add\s+(?:your\s+)?company/i,         /add\s+(?:a\s+)?company/i],
  "Business Registration": [/business\s+registration/i,           /business\s+sign[\s-]?up/i],
};

/**
 * Scans a text string against every entry in LISTING_SIGNALS.
 * Returns the labels of all matched signals.
 * Exported for isolated unit testing without network calls.
 */
export function detectKeywords(text: string): string[] {
  const matched: string[] = [];
  for (const [label, patterns] of Object.entries(LISTING_SIGNALS)) {
    if (patterns.some((re) => re.test(text))) {
      matched.push(label);
    }
  }
  return matched;
}

// ─── Content extractor ────────────────────────────────────────────────────────

/**
 * Builds a single combined string from multiple content sources on the page:
 *   1. Visible body text  — catches rendered JS content
 *   2. Anchor text        — <a> labels often contain listing CTAs
 *   3. Button / input labels — common location for "Add Business" CTAs
 *   4. aria-label attrs   — catches icon-only buttons with no visible text
 *
 * Combining all sources improves detection accuracy on JS-heavy sites.
 */
async function extractSearchableText(
  page: import("playwright").Page
): Promise<string> {
  const parts: string[] = [];

  // 1. Visible body text
  parts.push(await page.innerText("body").catch(() => ""));

  // 2. All anchor text
  parts.push(
    await page
      .$$eval("a", (els) => els.map((el) => el.textContent ?? "").join(" "))
      .catch(() => "")
  );

  // 3. Button and submit-input labels
  parts.push(
    await page
      .$$eval(
        'button, input[type="submit"], input[type="button"]',
        (els) =>
          els
            .map((el) => (el as HTMLInputElement).value || el.textContent || "")
            .join(" ")
      )
      .catch(() => "")
  );

  // 4. aria-label attributes across the whole page
  parts.push(
    await page
      .$$eval("[aria-label]", (els) =>
        els.map((el) => el.getAttribute("aria-label") ?? "").join(" ")
      )
      .catch(() => "")
  );

  return parts.join(" ");
}

// ─── Core crawler ─────────────────────────────────────────────────────────────

/**
 * Visits a URL with headless Chromium and returns:
 * - title             — page <title>
 * - description       — <meta name="description"> content
 * - freeListing       — true when ANY listing signal is detected
 * - detectedKeywords  — labels of every matched signal
 *
 * Never throws — all errors are captured in CrawlResult.error.
 *
 * @param url     - Full URL including protocol (https://...)
 * @param options - Optional timeout / user-agent overrides
 *
 * @example
 *   const result = await crawlWebsite("https://yelp.com");
 *   console.log(result.freeListing);       // true
 *   console.log(result.detectedKeywords);  // ["Free Listing", "Add Business"]
 */
export async function crawlWebsite(
  url: string,
  options: CrawlOptions = {}
): Promise<CrawlResult> {
  const timeoutMs = options.timeoutMs ?? defaultCrawlerConfig.timeoutMs;
  const userAgent = options.userAgent ?? defaultCrawlerConfig.userAgent;

  // Validate URL before any browser activity
  try {
    const parsed = new URL(url);
    if (!["http:", "https:"].includes(parsed.protocol)) {
      throw new Error(`Unsupported protocol: "${parsed.protocol}"`);
    }
  } catch (err) {
    return {
      url,
      title:            "",
      description:      "",
      freeListing:      false,
      detectedKeywords: [],
      crawledAt:        new Date(),
      error:            err instanceof Error ? err.message : `Invalid URL: "${url}"`,
    };
  }

  let context = null;

  try {
    const browser = await getBrowser();

    // Isolated context per crawl — separate cookies, localStorage, sessions
    context = await browser.newContext({
      userAgent,
      viewport: defaultCrawlerConfig.viewport,
    });

    const page = await context.newPage();

    // domcontentloaded is faster than networkidle and sufficient for
    // detecting text-based listing signals in the DOM
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout:   timeoutMs,
    });

    // Extract page metadata
    const title = await page.title();

    const description = await page
      .$eval(
        'meta[name="description"]',
        (el) => el.getAttribute("content") ?? ""
      )
      .catch(() => "");

    // Build combined text corpus from all searchable sources
    const searchableText = await extractSearchableText(page);

    // Detect listing signals across the full corpus
    const detectedKeywords = detectKeywords(searchableText);

    // freeListing is true when ANY signal is detected
    const freeListing = detectedKeywords.length > 0;

    return {
      url:    page.url(),
      title,
      description,
      freeListing,
      detectedKeywords,
      crawledAt: new Date(),
    };
  } catch (err) {
    return {
      url,
      title:            "",
      description:      "",
      freeListing:      false,
      detectedKeywords: [],
      crawledAt:        new Date(),
      error:            err instanceof Error ? err.message : "Crawl failed.",
    };
  } finally {
    // Always close the context to release memory and browser resources
    await context?.close();
  }
}

// ─── Batch crawler ────────────────────────────────────────────────────────────

/**
 * Crawls multiple URLs concurrently using a shared browser instance.
 * Individual failures are captured in CrawlResult.error — one bad URL
 * never aborts the rest of the batch.
 *
 * @param urls        - Array of URLs to crawl
 * @param options     - Shared crawl options for every URL
 * @param concurrency - Max simultaneous pages. Default: 3
 *
 * @example
 *   const results = await crawlBatch(["https://yelp.com", "https://manta.com"]);
 *   await closeBrowser(); // shut down Chromium when done
 */
export async function crawlBatch(
  urls: string[],
  options: CrawlOptions = {},
  concurrency = 3
): Promise<CrawlResult[]> {
  const results: CrawlResult[] = [];
  const queue = [...urls];

  async function worker(): Promise<void> {
    while (queue.length > 0) {
      const url = queue.shift();
      if (!url) break;
      results.push(await crawlWebsite(url, options));
    }
  }

  await getBrowser(); // warm up before workers start
  await Promise.all(
    Array.from({ length: Math.min(concurrency, urls.length) }, worker)
  );

  return results;
}

export { closeBrowser };
