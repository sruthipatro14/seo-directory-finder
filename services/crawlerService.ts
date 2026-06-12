// services/crawlerService.ts
//
// Uses Playwright (Chromium) to visit pages and extract SEO data.

import { defaultCrawlerConfig } from "@/crawler/crawler.config";
import { getBrowser, closeBrowser } from "@/crawler/browserPool";

// ─── Public result types ──────────────────────────────────────────────────────

export interface CrawlResult {
  title: string;
  description: string;
  homepageText: string;
  links: string[];
  freeListing: boolean;
  detectedKeywords: string[];
  // Optional parameters for backward compatibility with discovery pipeline
  url?: string;
  crawledAt?: Date;
  error?: string;
}

export interface CrawlOptions {
  timeoutMs?: number;
  userAgent?: string;
}

// ─── Keyword registry ─────────────────────────────────────────────────────────

const LISTING_SIGNALS: Record<string, RegExp[]> = {
  "Add Business":          [/add\s+(?:your\s+)?business/i,        /add\s+(?:a\s+)?listing/i],
  "Submit Listing":        [/submit\s+(?:a\s+|your\s+)?listing/i, /submit\s+(?:your\s+)?site/i],
  "Free Listing":          [/free\s+listing/i,                    /list\s+(?:for\s+)?free/i, /free\s+submission/i],
  "Create Profile":        [/create\s+(?:a\s+|your\s+)?(?:business\s+)?profile/i, /set\s+up\s+(?:your\s+)?profile/i],
  "Register Business":     [/register\s+(?:your\s+)?business/i,   /register\s+(?:a\s+)?company/i],
  "Add Company":           [/add\s+(?:your\s+)?company/i,         /add\s+(?:a\s+)?company/i],
  "Submit Business":       [/submit\s+(?:your\s+)?business/i,     /submit\s+(?:a\s+)?business/i],
};

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
      title:            "",
      description:      "",
      homepageText:     "",
      links:            [],
      freeListing:      false,
      detectedKeywords: [],
      url,
      crawledAt:        new Date(),
      error:            err instanceof Error ? err.message : `Invalid URL: "${url}"`,
    };
  }

  let context = null;

  try {
    const browser = await getBrowser();

    context = await browser.newContext({
      userAgent,
      viewport: defaultCrawlerConfig.viewport,
    });

    const page = await context.newPage();

    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout:   timeoutMs,
    });

    const title = await page.title();

    const description = await page
      .$eval(
        'meta[name="description"]',
        (el) => el.getAttribute("content") ?? ""
      )
      .catch(() => "");

    // Extract Homepage visible text
    const homepageText = await page.innerText("body").catch(() => "");

    // Extract navigation / anchor links
    const extractedLinks = await page.$$eval("a", (els) => 
      els.map((el) => el.getAttribute("href") ?? "")
    ).catch(() => [] as string[]);

    // Resolve absolute links and filter out non-HTTP links
    const resolvedLinks = Array.from(new Set(
      extractedLinks
        .map((href) => {
          try {
            return new URL(href, url).href;
          } catch {
            return "";
          }
        })
        .filter((resolvedUrl) => resolvedUrl.startsWith("http://") || resolvedUrl.startsWith("https://"))
    ));

    // Scan for keywords on all searchable text
    const searchableText = await extractSearchableText(page);
    const detectedKeywords = detectKeywords(searchableText);
    const freeListing = detectedKeywords.length > 0;

    return {
      title,
      description,
      homepageText,
      links: resolvedLinks,
      freeListing,
      detectedKeywords,
      url: page.url(),
      crawledAt: new Date(),
    };
  } catch (err) {
    return {
      title:            "",
      description:      "",
      homepageText:     "",
      links:            [],
      freeListing:      false,
      detectedKeywords: [],
      url,
      crawledAt:        new Date(),
      error:            err instanceof Error ? err.message : "Crawl failed.",
    };
  } finally {
    await context?.close();
  }
}

// ─── Batch crawler ────────────────────────────────────────────────────────────

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

  await getBrowser();
  await Promise.all(
    Array.from({ length: Math.min(concurrency, urls.length) }, worker)
  );

  return results;
}

export { closeBrowser };
