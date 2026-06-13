"use server";

import { runDiscoveryPipeline } from "@/services/discoveryPipeline";
import { saveSearch } from "@/services/searchHistoryService";
import type { Website } from "@prisma/client";

/** 
 * Server Action to trigger the end-to-end discovery pipeline from a Client Component.
 * HomepageClient → runDiscoveryPipeline(keyword) → ... → Prisma
 */
export async function searchWebsitesAction(keyword: string): Promise<Website[]> {
  console.log("Search started:", keyword);
  const report = await runDiscoveryPipeline(keyword);
  
  // PipelineResult already has the correct Website shape, so just cast it
  return report.results as Website[];
}

/** Server Action to log search history from a Client Component */
export async function recordSearchAction(keyword: string): Promise<void> {
  await saveSearch(keyword);
}