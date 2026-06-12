"use server";

import { runDiscoveryPipeline, PipelineResult } from "@/services/discoveryPipeline";
import { saveSearch }                            from "@/services/searchHistoryService";
import { Website }                               from "@/types/website";

/** Maps a PipelineResult to the UI Website interface. */
function toWebsite(r: PipelineResult): Website {
  return {
    id:              r.id,
    name:            r.name,
    url:             r.url,
    domainAuthority: r.domainAuthority,
    spamScore:       r.spamScore,
    freeListing:     r.freeListing,
    industry:        r.industry,
    daCategory:      r.daCategory,
    active:          r.active,
  };
}

/**
 * Server Action called by HeroSearch.
 * Saves the search keyword, runs the full discovery pipeline, and
 * returns processed websites alongside summary stats.
 */
export async function searchWebsites(keyword: string): Promise<{
  websites:   Website[];
  saved:      number;
  discovered: number;
  error?:     string;
}> {
  try {
    // Persist keyword to SearchHistory (fails gracefully if DB is down)
    await saveSearch(keyword).catch(() => null);

    const report = await runDiscoveryPipeline(keyword);

    return {
      websites:   report.results.map(toWebsite),
      saved:      report.saved,
      discovered: report.discovered,
    };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Pipeline failed.";
    return { websites: [], saved: 0, discovered: 0, error: message };
  }
}
