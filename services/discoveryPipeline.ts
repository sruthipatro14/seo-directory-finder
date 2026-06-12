// services/discoveryPipeline.ts
//
// Orchestrates the complete website discovery process end-to-end.
//
// Pipeline:
//   runDiscoveryPipeline(keyword)
//     ├── Step 1: discoverWebsites()     — find URLs via mock/Google/Bing
//     ├── Step 2: crawlWebsite()         — visit each URL with Playwright
//     ├── Step 3: (from crawl result)    — detect free listing signals
//     ├── Step 4: classifyIndustry()     — keyword or OpenAI classification
//     ├── Step 5: categorizeDa()         — map DA number → Low/Average/Excellent
//     ├── Step 6: createWebsite()        — persist to database (skipped if DB down)
//     └── Return: PipelineReport
//
// TODO [MOZ-1]: Integrate Moz API to populate real DA and spam scores.
//   Docs: https://moz.com/products/api
//   Replace the placeholder values (domainAuthority: 0, spamScore: 0) with:
//     const mozData = await getMozMetrics(url);
//     domainAuthority = mozData.domainAuthority;
//     spamScore       = mozData.spamScore;

import { discoverWebsites }           from "@/services/discoveryService";
import { crawlWebsite, closeBrowser } from "@/services/crawlerService";
import { classifyIndustry }           from "@/services/industryClassifier";
import { createWebsite }              from "@/services/websiteService";
import { DaCategory }                 from "@prisma/client";

// ─── Types ────────────────────────────────────────────────────────────────────

/** Shape returned by the pipeline — matches the Website UI interface exactly. */
export interface PipelineResult {
  id: string;
  name: string;
  url: string;
  domainAuthority: number;
  spamScore: number;
  freeListing: boolean;
  industry: string;
  daCategory: "Low" | "Average" | "Excellent";
  active: boolean;
}

export interface PipelineOptions {
  /**
   * When true, skips the database save step (Step 6).
   * Useful for dry-run / preview mode without persisting anything.
   * Default: false
   */
  dryRun?: boolean;
}

export interface PipelineReport {
  keyword: string;
  /** Total URLs returned by the discovery step. */
  discovered: number;
  /** URLs successfully processed through the full pipeline. */
  processed: number;
  /** URLs successfully saved to the database. */
  saved: number;
  /** URLs that failed processing and were skipped. */
  failed: number;
  results: PipelineResult[];
  startedAt: Date;
  completedAt: Date;
}

// ─── DA categorisation ────────────────────────────────────────────────────────

/**
 * Maps a numeric Domain Authority score to a category label.
 *
 * Ranges:
 *   0–20   → Low
 *   21–50  → Average
 *   51–100 → Excellent
 *
 * TODO [MOZ-2]: replace the placeholder DA (0) with a real Moz value
 *              before this function is called.
 */
function categorizeDa(da: number): "Low" | "Average" | "Excellent" {
  if (da <= 20) return "Low";
  if (da <= 50) return "Average";
  return "Excellent";
}

// ─── Pipeline logger ──────────────────────────────────────────────────────────

/** Lightweight prefixed logger — replace with a proper logger if needed. */
const log = {
  info:  (msg: string) => console.log(`[Pipeline]  ℹ  ${msg}`),
  ok:    (msg: string) => console.log(`[Pipeline]  ✓  ${msg}`),
  warn:  (msg: string) => console.warn(`[Pipeline]  ⚠  ${msg}`),
  error: (msg: string) => console.error(`[Pipeline]  ✗  ${msg}`),
  step:  (n: number, total: number, url: string) =>
    console.log(`[Pipeline]  [${n}/${total}]  ${url}`),
};

// ─── Per-URL processor ────────────────────────────────────────────────────────

/**
 * Runs steps 2–6 for a single discovered URL.
 * Returns null if the URL itself is invalid, fails to load, or has empty content.
 */
async function processUrl(
  discoveredUrl: string,
  discoveredTitle: string,
  index: number,
  total: number,
  dryRun: boolean
): Promise<PipelineResult | null> {
  log.step(index, total, discoveredUrl);

  // ── Step 2: Crawl the website with Playwright ──────────────────────────────
  log.info(`  Crawling ${discoveredUrl}…`);
  const crawl = await crawlWebsite(discoveredUrl);

  if (crawl.error) {
    log.warn(`  Crawl failed (${crawl.error}) — skipping`);
    return null;
  }

  if (!crawl.homepageText || !crawl.homepageText.trim()) {
    log.warn(`  Empty content returned — skipping`);
    return null;
  }

  log.ok(`  Crawled — title: "${crawl.title}"`);

  // ── Step 3: Free listing detection (already in CrawlResult) ───────────────
  const freeListing = crawl.freeListing;
  if (freeListing) {
    log.ok(
      `  Free listing detected — signals: [${crawl.detectedKeywords.join(", ")}]`
    );
  } else {
    log.info(`  No free listing signals detected`);
  }

  // ── Step 4: Classify industry ──────────────────────────────────────────────
  const classificationText = [
    crawl.title       || discoveredTitle,
    crawl.description || "",
    discoveredUrl,
  ].join(" ");

  log.info(`  Classifying industry…`);
  const classification = await classifyIndustry(classificationText);
  log.ok(
    `  Industry: "${classification.industry}" ` +
    `(${classification.confidence} confidence, ` +
    `${classification.matchedKeywords.length} keyword matches)`
  );

  // ── Step 5: Determine DA category ─────────────────────────────────────────
  const domainAuthority = 0;
  const spamScore       = 0;
  const daCategoryStr   = categorizeDa(domainAuthority);

  log.info(`  DA: ${domainAuthority} → category: ${daCategoryStr}`);

  // ── Step 6: Save to database ───────────────────────────────────────────────
  const websiteInput = {
    name:            crawl.title || discoveredTitle,
    url:             crawl.url   || discoveredUrl,
    domainAuthority,
    spamScore,
    freeListing,
    industry:        classification.industry,
    daCategory:      daCategoryStr as DaCategory,
    active:          true,
  };

  let savedId = `pending-${index}`;

  if (!dryRun) {
    try {
      log.info(`  Saving to database…`);
      const saved = await createWebsite(websiteInput);
      savedId = saved.id;
      log.ok(`  Saved — id: ${savedId}`);
    } catch (err) {
      log.warn(
        `  DB save skipped — ${err instanceof Error ? err.message : "unknown error"}`
      );
    }
  } else {
    log.info(`  Dry run — skipping database save`);
  }

  return {
    id:             savedId,
    name:           websiteInput.name,
    url:            websiteInput.url,
    domainAuthority,
    spamScore,
    freeListing,
    industry:       classification.industry,
    daCategory:     daCategoryStr,
    active:         true,
  };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Runs the full discovery pipeline for a given keyword.
 *
 * @param keyword - e.g. "business listing sites", "healthcare directories"
 * @param options - Optional dry-run control
 *
 * @returns PipelineReport — never throws; per-URL errors are captured internally
 */
export async function runDiscoveryPipeline(
  keyword: string,
  options: PipelineOptions = {}
): Promise<PipelineReport> {
  const { dryRun = false } = options;
  const startedAt = new Date();

  log.info(`══════════════════════════════════════════`);
  log.info(`Starting pipeline  keyword: "${keyword}"`);
  if (dryRun) log.info(`Dry run — database writes disabled`);
  log.info(`══════════════════════════════════════════`);

  // ── Step 1: Discover website URLs ──────────────────────────────────────────
  log.info(`Step 1 — Discovering websites…`);

  let discovery;
  try {
    discovery = await discoverWebsites(keyword);
    log.ok(
      `Step 1 done — ${discovery.results.length} URL(s) via "${discovery.provider}" provider`
    );
  } catch (err) {
    log.error(
      `Step 1 failed — ${err instanceof Error ? err.message : "unknown error"}`
    );
    return {
      keyword,
      discovered:  0,
      processed:   0,
      saved:       0,
      failed:      0,
      results:     [],
      startedAt,
      completedAt: new Date(),
    };
  }

  if (discovery.results.length === 0) {
    log.warn(`No URLs discovered — pipeline complete with zero results`);
    return {
      keyword,
      discovered:  0,
      processed:   0,
      saved:       0,
      failed:      0,
      results:     [],
      startedAt,
      completedAt: new Date(),
    };
  }

  // ── Steps 2–6: Process URLs in parallel using Promise.all ──────────────────
  log.info(
    `Steps 2–6 — Processing ${discovery.results.length} URL(s) in parallel…`
  );

  const promises = discovery.results.map((item, i) =>
    processUrl(item.url, item.title, i + 1, discovery.results.length, dryRun)
  );

  const rawResults = await Promise.all(promises);

  const results: PipelineResult[] = [];
  let saved  = 0;
  let failed = 0;

  for (const result of rawResults) {
    if (result !== null) {
      results.push(result);
      if (!result.id.startsWith("pending-")) {
        saved++;
      }
    } else {
      failed++;
    }
  }

  // ── Cleanup: close the shared Playwright browser ───────────────────────────
  await closeBrowser();
  log.ok(`Browser closed`);

  const completedAt = new Date();
  const durationMs  = completedAt.getTime() - startedAt.getTime();

  log.info(`══════════════════════════════════════════`);
  log.info(
    `Pipeline complete in ${durationMs}ms — ` +
    `discovered: ${discovery.results.length}, ` +
    `processed: ${results.length}, ` +
    `saved: ${saved}, ` +
    `failed: ${failed}`
  );
  log.info(`══════════════════════════════════════════`);

  return {
    keyword,
    discovered:  discovery.results.length,
    processed:   results.length,
    saved,
    failed,
    results,
    startedAt,
    completedAt,
  };
}
