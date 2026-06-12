"use server";

import { discoverWebsites } from "@/services/discoveryService";
import { saveSearch } from "@/services/searchHistoryService";
import { Website } from "@/types/website";

function mapToWebsite(
  result: { url: string; title: string },
  index: number
): Website {
  return {
    id: `discovered-${index}`,
    name: result.title,
    url: result.url,
    domainAuthority: 0,
    spamScore: 0,
    freeListing: false,
    industry: "General Business",
    daCategory: "Low",
    active: true,
  };
}

export async function searchWebsites(keyword: string): Promise<{
  websites: Website[];
  error?: string;
}> {
  try {
    await saveSearch(keyword);
    const response = await discoverWebsites(keyword);
    const websites = response.results.map(mapToWebsite);
    return { websites };
  } catch (err) {
    const message = err instanceof Error ? err.message : "Discovery failed.";
    return { websites: [], error: message };
  }
}
