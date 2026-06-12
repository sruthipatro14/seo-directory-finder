// services/discoveryService.ts
//
// Architecture:
//   discoverWebsites(keyword)
//     └── generateQueries(keyword)           — builds search query variants
//     └── DiscoveryProvider.search(queries)  — swappable backend
//           ├── MockProvider       (active now)
//           ├── GoogleProvider     (future — Google Custom Search API)
//           ├── BingProvider       (future — Bing Web Search API)
//           └── PlaywrightProvider (future — headless browser scraping)

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
  discoveredAt: Date;
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
    `${k}`,
    `${k} free submission`,
    `${k} submit your business`,
    `best ${k}`,
    `top ${k} websites`,
    `high DA ${k}`,
    `${k} low spam score`,
    `${k} directory list`,
  ];
}

// ─── Mock provider ────────────────────────────────────────────────────────────

const MOCK_DATABASE: Record<string, DiscoveryResult[]> = {
  default: [
    {
      url: "https://yelp.com",
      title: "Yelp — Business Directory",
      description: "Find local businesses, read reviews, and discover great places.",
      sourceQuery: "business listing sites",
    },
    {
      url: "https://yellowpages.com",
      title: "Yellow Pages",
      description: "Local business directory with listings across all industries.",
      sourceQuery: "business listing sites free submission",
    },
    {
      url: "https://manta.com",
      title: "Manta — Small Business Directory",
      description: "Discover and connect with local small businesses.",
      sourceQuery: "best business listing sites",
    },
    {
      url: "https://foursquare.com",
      title: "Foursquare — Places & Reviews",
      description: "Explore places and read tips from the community.",
      sourceQuery: "top business listing sites websites",
    },
  ],
  healthcare: [
    {
      url: "https://healthgrades.com",
      title: "Healthgrades — Doctor Finder",
      description: "Find doctors and read patient reviews.",
      sourceQuery: "healthcare directories",
    },
    {
      url: "https://vitals.com",
      title: "Vitals — Doctor Reviews",
      description: "Research doctors and read patient reviews across specialties.",
      sourceQuery: "healthcare directories free submission",
    },
    {
      url: "https://webmd.com/find-a-doctor",
      title: "WebMD Doctor Directory",
      description: "Find and research doctors by specialty and location.",
      sourceQuery: "best healthcare directories",
    },
    {
      url: "https://zocdoc.com",
      title: "Zocdoc — Book a Doctor",
      description: "Find doctors who take your insurance and book appointments online.",
      sourceQuery: "top healthcare directories websites",
    },
  ],
  "real estate": [
    {
      url: "https://zillow.com",
      title: "Zillow — Real Estate Listings",
      description: "Search homes, apartments, and real estate listings.",
      sourceQuery: "real estate directories",
    },
    {
      url: "https://realtor.com",
      title: "Realtor.com",
      description: "Find homes for sale, apartments, and real estate agents.",
      sourceQuery: "real estate directories free submission",
    },
    {
      url: "https://trulia.com",
      title: "Trulia — Homes for Sale & Rent",
      description: "Search millions of homes for sale and for rent.",
      sourceQuery: "best real estate directories",
    },
    {
      url: "https://homes.com",
      title: "Homes.com — Property Listings",
      description: "Search real estate listings and find your next home.",
      sourceQuery: "top real estate directories websites",
    },
  ],
  technology: [
    {
      url: "https://g2.com",
      title: "G2 — Software Reviews",
      description: "Business software and services reviews from real users.",
      sourceQuery: "technology directories",
    },
    {
      url: "https://capterra.com",
      title: "Capterra — Software Directory",
      description: "Find the best business software with user reviews.",
      sourceQuery: "technology directories free submission",
    },
    {
      url: "https://producthunt.com",
      title: "Product Hunt",
      description: "Discover the latest tech products and startups.",
      sourceQuery: "best technology directories",
    },
    {
      url: "https://alternativeto.net",
      title: "AlternativeTo — Software Alternatives",
      description: "Find alternatives to popular software and apps.",
      sourceQuery: "top technology directories websites",
    },
  ],
  finance: [
    {
      url: "https://bankrate.com",
      title: "Bankrate — Financial Guidance",
      description: "Compare rates on loans, savings, and financial products.",
      sourceQuery: "finance directories",
    },
    {
      url: "https://nerdwallet.com",
      title: "NerdWallet — Personal Finance",
      description: "Compare financial products and get expert advice.",
      sourceQuery: "finance directories free submission",
    },
    {
      url: "https://investopedia.com",
      title: "Investopedia — Finance Education",
      description: "Financial terms, concepts, and investment guides.",
      sourceQuery: "best finance directories",
    },
  ],
  education: [
    {
      url: "https://coursera.org",
      title: "Coursera — Online Courses",
      description: "Online courses and degrees from top universities.",
      sourceQuery: "education directories",
    },
    {
      url: "https://udemy.com",
      title: "Udemy — Online Learning",
      description: "Online courses taught by real-world experts.",
      sourceQuery: "education directories free submission",
    },
    {
      url: "https://edx.org",
      title: "edX — Online Education",
      description: "Access online courses from the world's best universities.",
      sourceQuery: "best education directories",
    },
  ],
  marketing: [
    {
      url: "https://hubspot.com",
      title: "HubSpot — CRM & Marketing",
      description: "CRM, marketing, sales, and service software.",
      sourceQuery: "marketing directories",
    },
    {
      url: "https://clutch.co",
      title: "Clutch — Agency Directory",
      description: "Find top agencies: web design, SEO, and digital marketing.",
      sourceQuery: "marketing directories free submission",
    },
    {
      url: "https://designrush.com",
      title: "DesignRush — Agency Marketplace",
      description: "Find verified agencies for branding, web design, and marketing.",
      sourceQuery: "best marketing directories",
    },
  ],
  legal: [
    {
      url: "https://avvo.com",
      title: "Avvo — Lawyer Directory",
      description: "Find lawyers, read reviews, and get legal guidance.",
      sourceQuery: "legal directories",
    },
    {
      url: "https://martindale.com",
      title: "Martindale — Attorney Finder",
      description: "Find attorneys and law firms with peer and client reviews.",
      sourceQuery: "legal directories free submission",
    },
    {
      url: "https://findlaw.com",
      title: "FindLaw — Legal Directory",
      description: "Find lawyers and legal information by practice area.",
      sourceQuery: "best legal directories",
    },
  ],
};

/**
 * Resolves a keyword to a mock dataset key.
 * Tries exact match first, then partial match, then falls back to "default".
 */
function resolveMockKey(keyword: string): string {
  const k = keyword.trim().toLowerCase();
  if (MOCK_DATABASE[k]) return k;
  const partial = Object.keys(MOCK_DATABASE).find(
    (key) => key !== "default" && k.includes(key)
  );
  return partial ?? "default";
}

class MockProvider implements DiscoveryProvider {
  readonly name = "mock";

  async search(queries: string[]): Promise<DiscoveryResult[]> {
    // Simulate async latency
    await new Promise((r) => setTimeout(r, 50));

    // Use the first query to resolve the keyword bucket
    const key = resolveMockKey(queries[0] ?? "");
    const results = MOCK_DATABASE[key] ?? MOCK_DATABASE.default;

    // Deduplicate by URL
    const seen = new Set<string>();
    return results.filter((r) => {
      if (seen.has(r.url)) return false;
      seen.add(r.url);
      return true;
    });
  }
}

// ─── Future provider stubs ────────────────────────────────────────────────────

/**
 * TODO: Implement using Google Custom Search JSON API.
 * Docs: https://developers.google.com/custom-search/v1/overview
 *
 * class GoogleProvider implements DiscoveryProvider {
 *   readonly name = "google";
 *   constructor(private readonly apiKey: string, private readonly cx: string) {}
 *
 *   async search(queries: string[]): Promise<DiscoveryResult[]> {
 *     const results: DiscoveryResult[] = [];
 *     for (const query of queries) {
 *       const res = await fetch(
 *         `https://www.googleapis.com/customsearch/v1?key=${this.apiKey}&cx=${this.cx}&q=${encodeURIComponent(query)}`
 *       );
 *       const data = await res.json();
 *       for (const item of data.items ?? []) {
 *         results.push({ url: item.link, title: item.title, description: item.snippet, sourceQuery: query });
 *       }
 *     }
 *     return results;
 *   }
 * }
 */

/**
 * TODO: Implement using Bing Web Search API.
 * Docs: https://learn.microsoft.com/en-us/bing/search-apis/bing-web-search/overview
 *
 * class BingProvider implements DiscoveryProvider {
 *   readonly name = "bing";
 *   constructor(private readonly apiKey: string) {}
 *
 *   async search(queries: string[]): Promise<DiscoveryResult[]> {
 *     const results: DiscoveryResult[] = [];
 *     for (const query of queries) {
 *       const res = await fetch(
 *         `https://api.bing.microsoft.com/v7.0/search?q=${encodeURIComponent(query)}`,
 *         { headers: { "Ocp-Apim-Subscription-Key": this.apiKey } }
 *       );
 *       const data = await res.json();
 *       for (const item of data.webPages?.value ?? []) {
 *         results.push({ url: item.url, title: item.name, description: item.snippet, sourceQuery: query });
 *       }
 *     }
 *     return results;
 *   }
 * }
 */

/**
 * TODO: Implement using Playwright for headless browser scraping.
 * Install: npm install playwright
 *
 * class PlaywrightProvider implements DiscoveryProvider {
 *   readonly name = "playwright";
 *
 *   async search(queries: string[]): Promise<DiscoveryResult[]> {
 *     const { chromium } = await import("playwright");
 *     const browser = await chromium.launch();
 *     const results: DiscoveryResult[] = [];
 *     for (const query of queries) {
 *       const page = await browser.newPage();
 *       await page.goto(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
 *       const items = await page.$$eval("div.g", (els) =>
 *         els.map((el) => ({
 *           url: el.querySelector("a")?.href ?? "",
 *           title: el.querySelector("h3")?.textContent ?? "",
 *           description: el.querySelector(".VwiC3b")?.textContent ?? "",
 *         }))
 *       );
 *       results.push(...items.map((i) => ({ ...i, sourceQuery: query })));
 *       await page.close();
 *     }
 *     await browser.close();
 *     return results;
 *   }
 * }
 */

// ─── Public API ───────────────────────────────────────────────────────────────

const activeProvider: DiscoveryProvider = new MockProvider();

/**
 * Discovers websites for a given keyword using the active provider.
 *
 * @param keyword  - e.g. "healthcare directories", "real estate directories"
 * @param provider - optional override; defaults to the module-level activeProvider
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
  provider: DiscoveryProvider = activeProvider
): Promise<DiscoveryResponse> {
  if (!keyword.trim()) {
    throw new Error("keyword must not be empty");
  }

  const queries = generateQueries(keyword);
  const results = await provider.search(queries);

  return {
    keyword,
    queries,
    results,
    provider: provider.name,
    discoveredAt: new Date(),
  };
}
