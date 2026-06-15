// services/crawlerService.ts
//
// Uses Playwright (Chromium) to visit pages and extract SEO data.

import { defaultCrawlerConfig, getRandomUserAgent, getRealisticHeaders } from "@/crawler/crawler.config";
import { getBrowser, closeBrowser } from "@/crawler/browserPool";
import { formatDateSafe } from "./dateUtils";
import { logger } from "./logger";

// ─── Public result types ──────────────────────────────────────────────────────

export interface CrawlResult {
  title: string;
  description: string;
  homepageText: string;
  links: string[];
  freeListing: boolean;
  detectedKeywords: string[];
  email?: string;
  socials: Record<string, string>;
  // Metadata for pipeline compatibility
  url?: string;
  crawledAt?: string;
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
  const crawledAt = formatDateSafe(new Date());
  const timeoutMs = options.timeoutMs ?? defaultCrawlerConfig.timeoutMs;
  const userAgent = options.userAgent ?? getRandomUserAgent();

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
      socials:           {},
      url,
      crawledAt,
      error:            "Invalid URL format",
    };
  }

  let context = null;

  try {
    const browser = await getBrowser();

    context = await browser.newContext({
      userAgent,
      viewport: defaultCrawlerConfig.viewport,
      extraHTTPHeaders: getRealisticHeaders(url),
    });

    const page = await context.newPage();

    // Navigate to the site with retry logic and backoff strategy
    let attempts = 0;
    const maxAttempts = 3;
    let delay = 1000;
    let response = null;
    let lastError = null;

    while (attempts < maxAttempts) {
      try {
        attempts++;
        response = await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout:   timeoutMs,
        });
        if (response && response.status() >= 400) {
          throw new Error(`HTTP status ${response.status()}`);
        }
        lastError = null;
        break; // Success!
      } catch (err) {
        lastError = err;
        if (attempts < maxAttempts) {
          console.warn(`[Crawler] Attempt ${attempts} failed for ${url}: ${err instanceof Error ? err.message : String(err)}. Retrying in ${delay}ms...`);
          await page.waitForTimeout(delay);
          delay *= 2; // exponential backoff
        }
      }
    }

    if (lastError) {
      throw lastError;
    }

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

    // Extract Email
    const email = extractedLinks
      .find(href => href.startsWith('mailto:'))
      ?.replace('mailto:', '')
      .split('?')[0];

    // Extract Socials
    const socials: Record<string, string> = {};
    const platforms = ['facebook', 'twitter', 'linkedin', 'instagram', 'youtube'];
    extractedLinks.forEach(link => {
      platforms.forEach(p => {
        if (link.includes(`${p}.com/`) && !socials[p]) {
          socials[p] = link;
        }
      });
    });

    return {
      title,
      description: description || title,
      homepageText,
      links: resolvedLinks,
      freeListing,
      detectedKeywords,
      email,
      socials,
      url: page.url(),
      crawledAt,
    };
  } catch (err) {
    return {
      title:            "",
      description:      "",
      homepageText:     "",
      links:            [],
      freeListing:      false,
      detectedKeywords: [],
      socials:           {},
      url,
      crawledAt:        formatDateSafe(new Date()),
      error:            err instanceof Error ? err.message : "Crawl failed.",
    };
  } finally {
    await context?.close();
  }
}

export { closeBrowser };
