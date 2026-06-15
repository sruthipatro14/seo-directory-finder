"use server";

import { runDiscoveryPipeline } from "@/services/discoveryPipeline";
import { saveSearch } from "@/services/searchHistoryService";
import type { Website } from "@prisma/client";

export interface SearchActionResponse {
  results: Website[];
  isFallback: boolean;
  source: string;
  discovered: number;
  saved: number;
}

/** 
 * Server Action to trigger the end-to-end discovery pipeline from a Client Component.
 * HomepageClient → runDiscoveryPipeline(keyword) → ... → Prisma
 */
export async function searchWebsitesAction(keyword: string): Promise<SearchActionResponse> {
  console.log("Search started:", keyword);
  const report = await runDiscoveryPipeline(keyword);
  console.log(`Discovery report — source=${report.source}, discovered=${report.discovered}, saved=${report.saved}, fallback=${report.isFallback}`);
  
  return {
    results: report.results as Website[],
    isFallback: report.isFallback,
    source: report.source,
    discovered: report.discovered,
    saved: report.saved,
  };
}

/** Server Action to log search history from a Client Component */
export async function recordSearchAction(keyword: string): Promise<void> {
  await saveSearch(keyword);
}