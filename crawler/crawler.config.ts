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
