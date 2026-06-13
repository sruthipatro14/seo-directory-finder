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
  // Metadata for pipeline compatibility
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

// ─── Content extractors ───────────────────────────────────────────────────────

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

  // 4. aria-label attributes
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
 * Visits a URL using Playwright and extracts SEO metadata and listing signals.
 */
export async function crawlWebsite(
  url: string,
  options: CrawlOptions = {}
): Promise<CrawlResult> {
  const timeoutMs = options.timeoutMs ?? defaultCrawlerConfig.timeoutMs;
  const userAgent = options.userAgent ?? defaultCrawlerConfig.userAgent;

  // Basic URL validation
  try {
    new URL(url);
  } catch {
    return {
      title:            "",
      description:      "",
      homepageText:     "",
      links:            [],
      freeListing:      false,
      detectedKeywords: [],
      url,
      crawledAt:        new Date(),
      error:            "Invalid URL format",
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

    // Navigate to the site
    await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout:   timeoutMs,
    });

    // 1. Extract Page Title
    const title = await page.title();

    // 2. Extract Meta Description
    const description = await page
      .$eval(
        'meta[name="description"]',
        (el) => el.getAttribute("content") ?? ""
      )
      .catch(() => "");

    // 3. Extract Homepage visible text
    const homepageText = await page.innerText("body").catch(() => "");

    // 4. Extract and resolve Navigation Links
    const extractedLinks = await page.$$eval("a", (els) => 
      els.map((el) => el.getAttribute("href") ?? "")
    ).catch(() => [] as string[]);

    const resolvedLinks = Array.from(new Set(
      extractedLinks
        .map((href) => {
          try {
            return new URL(href, url).href;
          } catch {
            return "";
          }
        })
        .filter((resolvedUrl) => resolvedUrl.startsWith("http"))
    ));

    // 5. Detect Listing Signals
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

export { closeBrowser };
