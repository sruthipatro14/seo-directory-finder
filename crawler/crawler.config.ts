// crawler/crawler.config.ts
// Central configuration for all Playwright crawl operations.
// Import defaultCrawlerConfig wherever you need consistent crawl settings.

export interface CrawlerConfig {
  /** Run browser in headless mode. Set to false for local debugging. */
  headless: boolean;
  /** Navigation timeout in milliseconds. */
  timeoutMs: number;
  /** User-agent string sent with every request. */
  userAgent: string;
  /** Browser viewport dimensions. */
  viewport: { width: number; height: number };
}

export const defaultCrawlerConfig: CrawlerConfig = {
  headless:  true,
  timeoutMs: 15_000,
  userAgent: "SEODirectoryBot/1.0 (+https://seodirectoryfinder.com/bot)",
  viewport:  { width: 1280, height: 800 },
};

export const USER_AGENTS = [
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/121.0",
  "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.2.1 Safari/605.1.15",
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36 Edg/122.0.0.0"
];

export function getRandomUserAgent(): string {
  return USER_AGENTS[Math.floor(Math.random() * USER_AGENTS.length)];
}

export function getRealisticHeaders(referer?: string): Record<string, string> {
  return {
    "Accept-Language": "en-US,en;q=0.9",
    "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,image/apng,*/*;q=0.8",
    "Referer": referer || "https://www.google.com/",
    "sec-ch-ua": '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
    "sec-ch-ua-mobile": "?0",
    "sec-ch-ua-platform": '"Windows"',
    "Sec-Fetch-Dest": "document",
    "Sec-Fetch-Mode": "navigate",
    "Sec-Fetch-Site": "cross-site",
    "Sec-Fetch-User": "?1",
    "Upgrade-Insecure-Requests": "1"
  };
}

