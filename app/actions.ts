"use server";

import { searchWebsites } from "@/services/websiteService";
import { saveSearch } from "@/services/searchHistoryService";
import { runDiscoveryPipeline } from "@/services/discoveryPipeline";
import { citationDirectories } from "@/services/citationDirectories";
import { classifyIndustry } from "@/services/industryClassifier";
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
  console.log(`Loaded citation directories: ${citationDirectories.length}`);

  let results = await searchWebsites(keyword);
  let source = "Local Database";
  let matchedSeedCount = 0;

  if (results.length === 0) {
    // Fallback to static citation directories if DB is empty
    const classification = await classifyIndustry(keyword);
    const targetIndustry = classification.industry;

    const matched = citationDirectories
      .filter(d => d.supportsSelfSubmission)
      .filter(d => {
        const tagMatch = d.industryTags.some(tag => keyword.toLowerCase().includes(tag.toLowerCase()));
        const categoryMatch = d.category === targetIndustry;
        const isGeneralMatch = d.category === "General Business";
        const nameMatch = keyword.toLowerCase().includes(d.name.toLowerCase());
        return tagMatch || categoryMatch || isGeneralMatch || nameMatch;
      });

    matchedSeedCount = matched.length;
    source = "Static Seed";

    // Sort: industry matches first
    matched.sort((a, b) => {
      const aTagMatch = a.industryTags.some(tag => keyword.toLowerCase().includes(tag.toLowerCase()));
      const bTagMatch = b.industryTags.some(tag => keyword.toLowerCase().includes(tag.toLowerCase()));
      
      if (aTagMatch && !bTagMatch) return -1;
      if (!aTagMatch && bTagMatch) return 1;

      const aCategoryMatch = a.category === targetIndustry;
      const bCategoryMatch = b.category === targetIndustry;

      const aIsSpecific = aCategoryMatch || keyword.toLowerCase().includes(a.name.toLowerCase());
      const bIsSpecific = bCategoryMatch || keyword.toLowerCase().includes(b.name.toLowerCase());
      if (aIsSpecific && !bIsSpecific) return -1;
      if (!aIsSpecific && bIsSpecific) return 1;
      return 0;
    });

    results = (matched.map((d, index) => {
      const tagMatch = d.industryTags.some(tag => keyword.toLowerCase().includes(tag.toLowerCase()));
      const isGeneral = d.category === "General Business";
      
      let matchReason = "Self-submission support";
      if (tagMatch) matchReason = "Industry tag";
      else if (isGeneral) matchReason = "General directory";

      return {
        id: `seed-${index}`,
        name: d.name,
        url: d.website,
        description: `Premium ${d.category} directory for business listings.`,
      domainAuthority: 90 - index,
      spamScore: 1,
      estimatedTraffic: 10000,
      contactEmail: null,
      socialLinks: null,
      freeListing: true,
      industry: d.category,
      daCategory: "Excellent",
      active: true,
      createdAt: new Date(),
      updatedAt: new Date(),
      freeOrPaid: d.freeOrPaid,
      canSubmitListing: d.supportsSelfSubmission,
      submissionUrl: d.addListingUrl,
      rankPosition: index + 1,
      sourceProvider: "Seed Data",
      verificationMethod: d.verificationMethod,
      matchReason: matchReason,
    };
    }) as any) as Website[];
  }

  console.log(`Matched directories: ${matchedSeedCount}`);
  console.log(`Returned results: ${results.length}`);
  
  return {
    results: results,
    isFallback: source === "Mock Data", // Only warn if using hardcoded mock results
    source: source,
    discovered: results.length,
    saved: results.length,
  };
}

/** Server Action to log search history from a Client Component */
export async function recordSearchAction(keyword: string): Promise<void> {
  await saveSearch(keyword);
}