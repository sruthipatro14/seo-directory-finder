import { getAllWebsites, saveDiscoveredWebsite } from "@/services/websiteService";
import { crawlWebsite, closeBrowser } from "@/services/crawlerService";
import { classifyIndustry } from "@/services/industryClassifier";
import { getMozMetrics } from "@/services/mozService";
import { categorizeDa } from "@/services/discoveryPipeline";
import { DaCategory } from "@prisma/client";

/**
 * Scheduler service to handle periodic directory maintenance.
 * Re-crawls every site in the database to keep SEO metrics and listings fresh.
 */
export async function runDailyRefresh() {
  const startTime = Date.now();
  console.log("[Scheduler] Starting daily refresh process...");

  // 1. Fetch all existing websites
  const websites = await getAllWebsites();
  console.log(`[Scheduler] Processing ${websites.length} websites.`);

  let successCount = 0;
  let failCount = 0;

  // 2. Iterate and update
  // Note: For large datasets, consider batching or using a worker queue (e.g. BullMQ)
  // to avoid hitting serverless timeout limits.
  for (let i = 0; i < websites.length; i++) {
    const site = websites[i];
    console.log(`[Scheduler] [${i + 1}/${websites.length}] Updating ${site.url}...`);

    try {
      // Re-crawl
      const crawl = await crawlWebsite(site.url);
      if (crawl.error) throw new Error(`Crawl error: ${crawl.error}`);

      // Refresh Moz Metrics (DA/Spam Score)
      const mozData = await getMozMetrics(site.url);

      // Re-classify Industry based on latest content
      const classificationText = [
        crawl.title,
        crawl.description,
        crawl.homepageText,
        site.url,
      ].join(" ");
      const classification = await classifyIndustry(classificationText);

      // Update Database (Upsert ensures we update existing records)
      await saveDiscoveredWebsite({
        url: site.url,
        name: crawl.title || site.name,
        domainAuthority: mozData.domainAuthority,
        spamScore: mozData.spamScore,
        industry: classification.industry,
        daCategory: categorizeDa(mozData.domainAuthority) as DaCategory,
        freeListing: crawl.freeListing,
        active: site.active,
      });

      successCount++;
    } catch (err) {
      console.error(`[Scheduler] Failed to refresh ${site.url}:`, err);
      failCount++;
    }
  }

  // 3. Cleanup
  await closeBrowser();
  
  const duration = ((Date.now() - startTime) / 1000).toFixed(2);
  console.log(`[Scheduler] Task finished. Success: ${successCount}, Failed: ${failCount}, Duration: ${duration}s`);
  
  return { successCount, failCount, duration };
}