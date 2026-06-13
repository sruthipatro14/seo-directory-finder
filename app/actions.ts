"use server";

import { runDiscoveryPipeline } from "@/services/discoveryPipeline";
import { saveSearch } from "@/services/searchHistoryService";
import { Website } from "@prisma/client";

/** 
 * Server Action to trigger the end-to-end discovery pipeline from a Client Component.
 * HomepageClient → runDiscoveryPipeline(keyword) → ... → Prisma
 */
export async function searchWebsitesAction(keyword: string): Promise<Website[]> {
  console.log("Search started:", keyword);
  const report = await runDiscoveryPipeline(keyword);
  
  // Map PipelineResult to Website type for the UI
  return report.results.map(r => ({
    ...r,
    daCategory: r.daCategory as any,
    createdAt: new Date(),
    updatedAt: new Date(),
  }));
}

/** Server Action to log search history from a Client Component */
export async function recordSearchAction(keyword: string): Promise<void> {
  await saveSearch(keyword);
}