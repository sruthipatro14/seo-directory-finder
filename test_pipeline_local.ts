import { runDiscoveryPipeline } from "./services/discoveryPipeline";

async function main() {
  console.log("Starting pipeline integration test...");
  try {
    const keyword = "healthcare directories";
    console.log(`Running pipeline for "${keyword}"...`);
    const report = await runDiscoveryPipeline(keyword, { dryRun: true });
    
    console.log("\nPipeline execution complete! Report:");
    console.log(JSON.stringify({
      keyword: report.keyword,
      discovered: report.discovered,
      processed: report.processed,
      saved: report.saved,
      failed: report.failed,
      resultsCount: report.results.length
    }, null, 2));

    if (report.results.length > 0) {
      console.log("\nSample Result:");
      console.log(JSON.stringify(report.results[0], null, 2));
    }
  } catch (err) {
    console.error("Pipeline threw an error:", err);
  }
}

main();
