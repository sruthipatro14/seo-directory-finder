"use server";

import { searchWebsites, WebsiteInput } from "@/services/websiteService";
import { saveSearch } from "@/services/searchHistoryService"; // Add this import
import { runDiscoveryPipeline } from "@/services/discoveryPipeline";
import { citationDirectories } from "@/services/citationDirectories";
import { classifyIndustry } from "@/services/industryClassifier";
import type { Website } from "@prisma/client";
import { normalizeUrl } from "@/services/urlUtils";

export interface SearchActionResponse {
  results: Website[];
  isFallback: boolean;
  source: string;
  discovered: number;
  saved: number;
}

/**
 * Internal interface for merging results from multiple sources.
 */
interface HybridResult {
  id: string;
  name: string;
  url: string;
  industry?: string;
  domainAuthority?: number;
  spamScore?: number;
  canSubmitListing?: boolean;
  source?: "api" | "database" | "static-seed";
  matchReason?: string;
  [key: string]: any;
}

/**
 * Server Action to trigger the end-to-end discovery pipeline from a Client Component.
 * HomepageClient → runDiscoveryPipeline(keyword) → ... → Prisma
 */
export async function searchWebsitesAction(keyword: string): Promise<SearchActionResponse> {
  console.log("Search started:", keyword);

  // 1. Trigger Discovery Pipeline and Database search in parallel
  const [pipelineReport, dbResults] = await Promise.all([
    runDiscoveryPipeline(keyword),
    searchWebsites(keyword)
  ]);

  // 2. Process Static Seed results
  const classification = await classifyIndustry(keyword);
  const targetIndustry = classification.industry;

  // Audit logs for submission signals
  console.log(
    "API submit count:",
    pipelineReport.results.filter(r => r.canSubmitListing).length
  );
  console.log(
    "DB submit count:",
    dbResults.filter(r => r.canSubmitListing).length
  );

  // 2. Process Static Seed results
  const staticSeedResults: HybridResult[] = citationDirectories
    .filter(d => d.supportsSelfSubmission)
    .filter(d => {
      const tagMatch = d.industryTags.some(tag => keyword.toLowerCase().includes(tag.toLowerCase()));
      const categoryMatch = d.category === targetIndustry;
      const isGeneralMatch = d.category === "General Business";
      const nameMatch = keyword.toLowerCase().includes(d.name.toLowerCase());
      return tagMatch || categoryMatch || isGeneralMatch || nameMatch;
    })
    .map((d, index) => {
      const tagMatch = d.industryTags.some(tag => keyword.toLowerCase().includes(tag.toLowerCase()));
      const isGeneral = d.category === "General Business";
      let matchReason = "Self-submission support";
      if (tagMatch) matchReason = "Industry tag";
      else if (isGeneral) matchReason = "General directory";

      return {
        id: `seed-${index}-${d.name.toLowerCase().replace(/\s+/g, '-')}`,
        name: d.name,
        url: d.website,
        description: `Premium ${d.category} directory for business listings.`,
        domainAuthority: 80,
        spamScore: 1,
        estimatedTraffic: 5000,
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
        rankPosition: 100,
        sourceProvider: "Static Seed",
        verificationMethod: d.verificationMethod,
        matchReason,
        source: 'static-seed'
      } as HybridResult;
    });

  console.log("Seed submit count:", staticSeedResults.filter(r => r.canSubmitListing).length);

  // 3. Merge and Deduplicate by Domain
  const allRawResults: HybridResult[] = [
    ...dbResults.map(r => ({ ...r, source: 'database' as const })),
    ...pipelineReport.results.map(r => ({ ...r, source: 'api' as const })),
    ...staticSeedResults
  ];

  const seenDomains = new Set<string>();
  const finalResults: HybridResult[] = [];

  for (const item of allRawResults) {
    try {
      const domain = new URL(normalizeUrl(item.url)).hostname.replace(/^www\./, "");
      if (!seenDomains.has(domain)) {
        seenDomains.add(domain);
        finalResults.push(item);
      }
    } catch {
      continue; // Skip invalid URLs
    }
  }

  // 4. Ranking Logic: Industry Specific > General > DA
  finalResults.sort((a, b) => {
    const aIsIndustry = a.industry === targetIndustry || a.matchReason === "Industry tag" || a.matchReason === "Self-submission signals detected";
    const bIsIndustry = b.industry === targetIndustry || b.matchReason === "Industry tag" || b.matchReason === "Self-submission signals detected";

    if (aIsIndustry && !bIsIndustry) return -1;
    if (!aIsIndustry && bIsIndustry) return 1;

    const aIsGeneral = a.industry === "General Business" || a.matchReason === "General directory";
    const bIsGeneral = b.industry === "General Business" || b.matchReason === "General directory";

    if (aIsGeneral && !bIsGeneral) return -1;
    if (!aIsGeneral && bIsGeneral) return 1;

    return (b.domainAuthority || 0) - (a.domainAuthority || 0);
  });

  // Verify final counts
  console.log({
    api: pipelineReport.results.length,
    db: dbResults.length,
    seed: staticSeedResults.length,
    merged: allRawResults.length,
    unique: finalResults.length,
    filtered: finalResults.length // Currently no extra filter applied after dedupe here
  });

  return {
    // Safer cast through unknown
    results: finalResults as unknown as Website[],
    isFallback: pipelineReport.isFallback,
    source: "Hybrid Discovery",
    discovered: pipelineReport.discovered + staticSeedResults.length + dbResults.length,
    saved: pipelineReport.saved + dbResults.length,
  };
}

/** Server Action to log search history from a Client Component */
export async function recordSearchAction(keyword: string): Promise<void> {
  await saveSearch(keyword);
}