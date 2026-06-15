// services/discoveryService.ts
//
// Architecture:
//   discoverWebsites(keyword)
//     └── generateQueries(keyword)           — builds search query variants
//     └── DiscoveryProvider.search(queries)  — swappable backend
//           ├── MockProvider       (active now)
//           ├── GoogleProvider     (future — Google Custom Search API)
//           ├── BingProvider       (future — Bing Web Search API)
//           ├── BraveSearchProvider (Active fallback)
//           ├── BingSearchProvider (Active fallback)
//           └── SerpApiProvider    (Primary — Real Google Discovery)

import { formatDateSafe } from "./dateUtils"; // Keep this import
import { mapConcurrent } from "@/lib/concurrency"; // Ensure this import is present and correct
import { normalizeUrl } from "./urlUtils";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface DiscoveryResult {
  url: string;
  title: string;
  description: string;
  sourceQuery: string;
}

export interface DiscoveryResponse {
  keyword: string;
  queries: string[];
  results: DiscoveryResult[];
  provider: string;
  discoveredAt: string;
  filteredCount?: number;
}

/** Every provider must implement this contract. */
export interface DiscoveryProvider {
  readonly name: string;
  search(queries: string[]): Promise<DiscoveryResult[]>;
}

// ─── Query generator ──────────────────────────────────────────────────────────

/**
 * Expands a single keyword into multiple search query variants to maximise
 * discovery surface. Future providers can feed these directly into a search API
 * or drive a Playwright browser session.
 */
export function generateQueries(keyword: string): string[] {
  const k = keyword.trim().toLowerCase();
  return [
    `best ${k} business directories`,
    `${k} directory submit listing`,
    `add your business to ${k} directories`,
    `top high da ${k} listing sites`,
    `free business directories for ${k}`
  ];
}

// ─── Config ───────────────────────────────────────────────────────────────────

/**
 * MockProvider returns static sample results when no API keys are found.
 */
class MockProvider implements DiscoveryProvider {
  readonly name = "mock";
  async search(queries: string[]): Promise<DiscoveryResult[]> {
    const query = queries[0] || "business directory";
    return [
      {
        url: "https://www.yelp.com",
        title: "Yelp",
        description: "Find local businesses, read reviews, and discover great places.",
        sourceQuery: query,
      },
      {
        url: "https://www.crunchbase.com",
        title: "Crunchbase",
        description: "Discover innovative companies and the people behind them.",
        sourceQuery: query,
      },
      {
        url: "https://www.yellowpages.com",
        title: "Yellow Pages",
        description: "Local business directory with listings across all industries.",
        sourceQuery: query,
      },
      {
        url: "https://www.hotfrog.com",
        title: "Hotfrog",
        description: "Helping you find the right customers for your business.",
        sourceQuery: query,
      },
    ];
  }
}

import { getBrowser } from "@/crawler/browserPool";
import { getRandomUserAgent, getRealisticHeaders } from "@/crawler/crawler.config";

export function shouldExcludeUrl(urlStr: string): boolean {
  try {
    const url = new URL(urlStr);
    const host = url.hostname.toLowerCase();
    
    const excludePatterns = [
      "yelp.com",
      "yellowpages.com",
      "hotfrog.com",
      "facebook.com",
      "instagram.com",
      "linkedin.com",
      "wikipedia.org",
      "twitter.com",
      "x.com",
      "youtube.com",
      "pinterest.com",
      "cylex.com",
      "cylex.us.com",
      "foursquare.com",
      "crunchbase.com",
      "google.com",
      "yahoo.com",
      "bing.com",
      "duckduckgo.com",
      "startpage.com",
      "brave.com",
      "mapquest.com",
      "tripadvisor.com",
      "local.com",
      "superpages.com",
      "manta.com",
      "bbb.org",
      "angis.com",
      "chamberofcommerce.com",
      "bizjournals.com",
      "bloomberg.com",
    ];
    return excludePatterns.some(pattern => host.endsWith(pattern) || host.includes("." + pattern + ".") || host === pattern);
  } catch {
    return true; // Exclude invalid URLs
  }
}

export function rateUrlPriority(urlStr: string): number {
  try {
    const url = new URL(urlStr);
    let score = 100;
    
    // De-prioritize paths that look like listings, categories, or deep directories
    const path = url.pathname.toLowerCase();
    if (path.includes("/category/") || path.includes("/tag/") || path.includes("/search/") || path.includes("/directory/")) {
      score -= 60;
    }
    if (path.includes("/blog/") || path.includes("/news/") || path.includes("/article/")) {
      score -= 30;
    }
    if (path.includes("/about") || path.includes("/contact") || path.includes("/services")) {
      score += 15;
    }
    
    // Prioritize root domain or very short path (highly likely to be official company homepage)
    const pathSegments = path.split("/").filter(Boolean);
    if (pathSegments.length === 0) {
      score += 30; // Root domain: https://example.com
    } else if (pathSegments.length === 1) {
      score += 15; // e.g. https://example.com/about or https://example.com/home
    } else if (pathSegments.length > 3) {
      score -= 25; // Deeply nested URL
    }
    
    return score;
  } catch {
    return 0;
  }
}

export function decodeRedirectUrl(href: string): string | null {
  try {
    const url = new URL(href);
    if (url.pathname.includes("biz_redir") || url.pathname.includes("redir")) {
      const target = url.searchParams.get("url");
      if (target) return target;
    }
    if (url.pathname === "/l/" || url.pathname.includes("uddg")) {
      const target = url.searchParams.get("uddg");
      if (target) return decodeURIComponent(target);
    }
    if (url.pathname === "/url") {
      const target = url.searchParams.get("q");
      if (target) return target;
    }
  } catch {}
  return null;
}

function normalizeExternalUrl(href: string, baseUrl: string): string | null {
  if (!href) return null;
  const trimmed = href.trim();
  if (
    trimmed.startsWith("javascript:") ||
    trimmed.startsWith("mailto:") ||
    trimmed.startsWith("#") ||
    trimmed.startsWith("tel:")
  ) {
    return null;
  }

  const normalizedHref = trimmed.startsWith("//") ? `https:${trimmed}` : trimmed;

  try {
    const decoded = decodeRedirectUrl(normalizedHref);
    const target = decoded || normalizedHref;
    const url = new URL(target, baseUrl);
    if (!["http:", "https:"].includes(url.protocol)) return null;
    return url.href.replace(/\/$/, "");
  } catch {
    return null;
  }
}

function extractCoreKeyword(queries: string[]): string {
  if (queries.length === 0) return "business";
  const first = queries[0];
  if (first.startsWith("best ") && first.endsWith(" business directories")) {
    return first.slice(5, -21);
  }
  let clean = first;
  const stripPhrases = [
    /best\s+/i,
    /\s+business\s+directories/i,
    /\s+directory\s+submit\s+listing/i,
    /add\s+your\s+business\s+to\s+/i,
    /\s+directories/i,
    /top\s+high\s+da\s+/i,
    /\s+listing\s+sites/i,
    /free\s+business\s+directories\s+for\s+/i
  ];
  for (const regex of stripPhrases) {
    clean = clean.replace(regex, "");
  }
  return clean.trim() || "business";
}

async function extractYellowPagesLinks(page: any, baseUrl: string): Promise<Array<{ url: string; title: string }>> {
  return page.$$eval("a", (els: any[]) => {
    return els.map(el => ({
      href: el.getAttribute("href") || "",
      text: el.textContent?.trim() || ""
    }));
  }).then((links: any[]) => {
    const out: Array<{ url: string; title: string }> = [];
    for (const link of links) {
      const url = normalizeExternalUrl(link.href, baseUrl);
      if (!url || shouldExcludeUrl(url)) continue;
      
      let title = link.text;
      if (title === "Website" || !title) {
        try {
          title = new URL(url).hostname;
        } catch {
          title = "Business Website";
        }
      }
      out.push({ url, title });
    }
    return out;
  });
}

async function extractYelpLinks(page: any, baseUrl: string): Promise<Array<{ url: string; title: string }>> {
  return page.$$eval("a", (els: any[]) => {
    return els.map(el => ({
      href: el.getAttribute("href") || "",
      text: el.textContent?.trim() || ""
    }));
  }).then((links: any[]) => {
    const out: Array<{ url: string; title: string }> = [];
    for (const link of links) {
      const url = normalizeExternalUrl(link.href, baseUrl);
      if (!url || shouldExcludeUrl(url)) continue;
      out.push({ url, title: link.text || new URL(url).hostname });
    }
    return out;
  });
}

async function extractBraveLinks(page: any, baseUrl: string): Promise<Array<{ url: string; title: string }>> {
  return page.$$eval("a", (els: any[]) => {
    return els.map(el => ({
      href: el.getAttribute("href") || "",
      text: el.textContent?.trim() || ""
    }));
  }).then((links: any[]) => {
    const out: Array<{ url: string; title: string }> = [];
    for (const link of links) {
      const url = normalizeExternalUrl(link.href, baseUrl);
      if (!url || shouldExcludeUrl(url)) continue;
      out.push({ url, title: link.text || new URL(url).hostname });
    }
    return out;
  });
}

async function extractStartpageLinks(page: any, baseUrl: string): Promise<Array<{ url: string; title: string }>> {
  return page.$$eval("a", (els: any[]) => {
    return els.map(el => ({
      href: el.getAttribute("href") || "",
      text: el.textContent?.trim() || ""
    }));
  }).then((links: any[]) => {
    const out: Array<{ url: string; title: string }> = [];
    for (const link of links) {
      const url = normalizeExternalUrl(link.href, baseUrl);
      if (!url || shouldExcludeUrl(url)) continue;
      
      let title = link.text.replace(/<[^>]*>/g, "").replace(/\.css-[^{]*\{[^}]*\}/g, "").trim();
      if (!title || title.includes("favicon") || title.startsWith("http")) {
        try {
          title = new URL(url).hostname;
        } catch {
          title = "Business Website";
        }
      }
      out.push({ url, title });
    }
    return out;
  });
}

async function extractDuckDuckGoLinks(page: any, baseUrl: string): Promise<Array<{ url: string; title: string }>> {
  return page.$$eval("a", (els: any[]) => {
    return els.map(el => ({
      href: el.getAttribute("href") || "",
      text: el.textContent?.trim() || ""
    }));
  }).then((links: any[]) => {
    const out: Array<{ url: string; title: string }> = [];
    for (const link of links) {
      const url = normalizeExternalUrl(link.href, baseUrl);
      if (!url || shouldExcludeUrl(url)) continue;
      out.push({ url, title: link.text || new URL(url).hostname });
    }
    return out;
  });
}

class DirectoryFallbackProvider implements DiscoveryProvider {
  readonly name = "directory-fallback";

  async search(queries: string[]): Promise<DiscoveryResult[]> {
    const allResults: DiscoveryResult[] = [];
    const seen = new Set<string>();
    const coreKeyword = extractCoreKeyword(queries);

    console.log(`[DirectoryFallbackProvider] Running Playwright fallback discovery for keyword: "${coreKeyword}"`);

    const targets: Array<{ url: string; type: "yellowpages" | "yelp" | "brave" | "startpage" | "duckduckgo", query: string }> = [
      {
        url: `https://www.yellowpages.com/search?search_terms=${encodeURIComponent(coreKeyword)}&geo_location_terms=United+States`,
        type: "yellowpages",
        query: coreKeyword
      },
      {
        url: `https://www.yelp.com/search?find_desc=${encodeURIComponent(coreKeyword)}&find_loc=United+States`,
        type: "yelp",
        query: coreKeyword
      },
      {
        url: `https://search.brave.com/search?q=${encodeURIComponent(queries[0])}`,
        type: "brave",
        query: queries[0]
      },
      {
        url: `https://www.startpage.com/sp/search?q=${encodeURIComponent(queries[0])}`,
        type: "startpage",
        query: queries[0]
      },
      {
        url: `https://html.duckduckgo.com/html/?q=${encodeURIComponent(queries[0])}`,
        type: "duckduckgo",
        query: queries[0]
      }
    ];

    if (queries[1]) {
      targets.push({
        url: `https://search.brave.com/search?q=${encodeURIComponent(queries[1])}`,
        type: "brave",
        query: queries[1]
      });
    }

    let browser;
    try {
      browser = await getBrowser();
    } catch (err) {
      console.error("[DirectoryFallbackProvider] Playwright browser launch failed:", err);
      console.warn("[DirectoryFallbackProvider] Falling back to MockProvider results due to browser launch failure.");
      return new MockProvider().search(queries);
    }

    const context = await browser.newContext({
      userAgent: getRandomUserAgent(),
      viewport: { width: 1280, height: 800 },
      extraHTTPHeaders: getRealisticHeaders()
    });

    const concurrency = 2;
    await mapConcurrent(targets, concurrency, async (target) => {
      const page = await context.newPage();
      try {
        console.log(`[DirectoryFallbackProvider] Fetching: ${target.url}`);
        const response = await page.goto(target.url, {
          waitUntil: "domcontentloaded",
          timeout: 25000,
        });

        if (!response || response.status() >= 400) {
          console.warn(`[DirectoryFallbackProvider] Failed to load ${target.url}, status: ${response?.status()}`);
          return;
        }

        await page.waitForTimeout(1500);

        let extracted: Array<{ url: string; title: string }> = [];
        if (target.type === "yellowpages") {
          extracted = await extractYellowPagesLinks(page, target.url);
        } else if (target.type === "yelp") {
          extracted = await extractYelpLinks(page, target.url);
        } else if (target.type === "brave") {
          extracted = await extractBraveLinks(page, target.url);
        } else if (target.type === "startpage") {
          extracted = await extractStartpageLinks(page, target.url);
        } else if (target.type === "duckduckgo") {
          extracted = await extractDuckDuckGoLinks(page, target.url);
        }

        console.log(`[DirectoryFallbackProvider] Extracted ${extracted.length} candidates from ${target.type}`);

        for (const item of extracted) {
          try {
            const normalized = new URL(item.url).href;
            if (shouldExcludeUrl(normalized)) {
              continue;
            }
            if (seen.has(normalized)) continue;
            seen.add(normalized);

            allResults.push({
              url: normalized,
              title: item.title,
              description: `Discovered via ${target.type} search for "${target.query}"`,
              sourceQuery: target.query
            });
          } catch {}
        }
      } catch (err) {
        console.error(`[DirectoryFallbackProvider] Error scraping ${target.url}:`, err);
      } finally {
        await page.close().catch(() => {});
      }
    });

    await context.close().catch(() => {});

    // Prioritize results: official websites, business domains
    allResults.sort((a, b) => rateUrlPriority(b.url) - rateUrlPriority(a.url));

    console.log(`[DirectoryFallbackProvider] Total unique URLs extracted: ${allResults.length}`);

    if (allResults.length === 0) {
      console.warn("[DirectoryFallbackProvider] No real URLs could be extracted. Falling back to static mock results.");
      return new MockProvider().search(queries);
    }

    return allResults;
  }
}


// ─── Providers ────────────────────────────────────────────────────────────────

class SerpApiProvider implements DiscoveryProvider {
  readonly name = "serpapi";
  constructor(private readonly apiKey: string) {}

  async search(queries: string[]): Promise<DiscoveryResult[]> {
    if (!this.apiKey) {
      console.warn("[SerpApiProvider] API key missing (SERPAPI_KEY). Falling back to mock.");
      return new MockProvider().search(queries);
    }

    const allResults: DiscoveryResult[] = [];
    
    for (const query of queries) {
      try {
        const params = new URLSearchParams({
          engine: "google",
          q: query,
          api_key: this.apiKey,
          google_domain: "google.com",
          gl: "us",
          hl: "en",
        });

        const response = await fetch(`https://serpapi.com/search.json?${params.toString()}`);
        if (!response.ok) {
          console.error(`[SerpApiProvider] Error: ${response.status} ${response.statusText}`);
          continue;
        }

        const data = await response.json();
        const organicResults = data.organic_results || [];

        for (const res of organicResults) {
          if (res.link) {
            allResults.push({
              url: res.link,
              title: res.title || "No Title",
              description: res.snippet || "No Description",
              sourceQuery: query,
            });
          }
        }
      } catch (err) {
        console.error(`[SerpApiProvider] Failed to fetch results for "${query}":`, err);
      }
    }

    return allResults;
  }
}

class BraveSearchProvider implements DiscoveryProvider {
  readonly name = "brave";
  constructor(private readonly apiKey: string) {}

  async search(queries: string[]): Promise<DiscoveryResult[]> {
    const allResults: DiscoveryResult[] = [];
    for (const query of queries) {
      try {
        const response = await fetch(
          `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`,
          { headers: { "X-Subscription-Token": this.apiKey, "Accept": "application/json" } }
        );
        if (!response.ok) continue;
        const data = await response.json();
        const webResults = data.web?.results || [];
        for (const res of webResults) {
          allResults.push({
            url: res.url,
            title: res.title,
            description: res.description,
            sourceQuery: query,
          });
        }
      } catch (err) {
        console.error(`[BraveSearchProvider] Failed for "${query}":`, err);
      }
    }
    return allResults;
  }
}

class BingSearchProvider implements DiscoveryProvider {
  readonly name = "bing";
  constructor(private readonly apiKey: string) {}

  async search(queries: string[]): Promise<DiscoveryResult[]> {
    const allResults: DiscoveryResult[] = [];
    for (const query of queries) {
      try {
        const response = await fetch(
          `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}&count=10`,
          { headers: { "Ocp-Apim-Subscription-Key": this.apiKey } }
        );
        if (!response.ok) continue;
        const data = await response.json();
        const webPages = data.webPages?.value || [];
        for (const res of webPages) {
          allResults.push({
            url: res.url,
            title: res.name,
            description: res.snippet,
            sourceQuery: query,
          });
        }
      } catch (err) {
        console.error(`[BingSearchProvider] Failed for "${query}":`, err);
      }
    }
    return allResults;
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Selects the best available discovery provider based on API keys.
 * Priority: SerpApi > Brave Search > Bing Search > Mock Fallback
 */
function isConfigured(key: string | undefined): boolean {
  if (!key) return false;
  const clean = key.trim().toLowerCase();
  return clean !== "" && clean !== "your_key_here" && clean !== "placeholder" && clean !== "your-secret-here";
}

function selectProvider(): DiscoveryProvider {
  const serpApiKey = process.env.SERPAPI_KEY;
  const braveApiKey = process.env.BRAVE_API_KEY;
  const bingApiKey = process.env.BING_API_KEY;

  const hasSerpApi = isConfigured(serpApiKey);
  const hasBrave = isConfigured(braveApiKey);
  const hasBing = isConfigured(bingApiKey);

  console.log(
    `[Discovery] API key status — SERPAPI=${hasSerpApi}, BRAVE=${hasBrave}, BING=${hasBing}`
  );

  if (hasSerpApi && serpApiKey) {
    console.log("[Discovery] Initializing primary provider: SerpApi");
    return new SerpApiProvider(serpApiKey);
  }
  if (hasBrave && braveApiKey) {
    console.log("[Discovery] Initializing fallback provider: Brave Search");
    return new BraveSearchProvider(braveApiKey);
  }
  if (hasBing && bingApiKey) {
    console.log("[Discovery] Initializing fallback provider: Bing Search");
    return new BingSearchProvider(bingApiKey);
  }

  console.warn("[Discovery] No active API keys found. Using directory fallback provider.");
  return new DirectoryFallbackProvider();
}

/**
 * Discovers websites for a given keyword using the active provider.
 *
 * @param keyword  - e.g. "healthcare directories", "real estate directories"
 * @param provider - optional override; defaults to a provider selected at call time
 *
 * Usage:
 *   const response = await discoverWebsites("healthcare directories");
 *   console.log(response.results); // DiscoveryResult[]
 *
 * Switching providers (future):
 *   const response = await discoverWebsites("healthcare directories", new GoogleProvider(apiKey, cx));
 */
export async function discoverWebsites(
  keyword: string,
  provider: DiscoveryProvider = selectProvider()
): Promise<DiscoveryResponse> {
  if (!keyword.trim()) {
    throw new Error("keyword must not be empty");
  }

  const queries = generateQueries(keyword);
  console.log("[Discovery] Provider selected for runtime search:", provider.name);
  console.log("[Discovery] Search queries:", queries);
  
  let rawResults = await provider.search(queries);
  console.log("[Discovery] Raw discovery results count:", rawResults.length);

  let activeProviderName = provider.name;

  if (rawResults.length === 0 && provider.name !== "directory-fallback") {
    console.warn(`[Discovery] Provider "${provider.name}" returned 0 results. Falling back to directory-fallback provider...`);
    const fallbackProvider = new DirectoryFallbackProvider();
    rawResults = await fallbackProvider.search(queries);
    console.log("[Discovery] Fallback provider raw results count:", rawResults.length);
    activeProviderName = fallbackProvider.name;
  }

  // Remove duplicates, excluded domains and invalid URLs
  const seen = new Set<string>();
  let filteredCount = 0;
  const results = rawResults.filter((r) => {
    try {
      const normalized = normalizeUrl(r.url);
      if (shouldExcludeUrl(normalized)) {
        filteredCount++;
        return false;
      }
      if (seen.has(normalized)) return false;
      seen.add(normalized);
      return true;
    } catch {
      filteredCount++;
      return false;
    }
  });

  // Sort by priority (company website / business domain)
  results.sort((a, b) => rateUrlPriority(b.url) - rateUrlPriority(a.url));

  console.log("[Discovery] Discovered URLs:", results.map((item) => item.url));

  return {
    keyword,
    queries,
    results,
    provider: activeProviderName,
    discoveredAt: formatDateSafe(new Date()),
    filteredCount,
  };
}
