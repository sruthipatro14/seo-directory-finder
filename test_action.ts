import { searchWebsitesAction } from "./app/actions";

async function main() {
  console.log("Executing searchWebsitesAction('dentist')...");
  const res = await searchWebsitesAction("dentist");
  console.log("ACTION RESPONSE:", {
    isFallback: res.isFallback,
    source: res.source,
    discovered: res.discovered,
    saved: res.saved,
    resultsCount: res.results.length,
  });
  if (res.results.length > 0) {
    console.log("Sample Result 0:", res.results[0]);
  }
}

main();
