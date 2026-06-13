import HomepageClient from "@/components/HomepageClient";
import { searchWebsites } from "@/services/websiteService";
import type { Website } from "@prisma/client";

export default async function Home() {
  // Fetch initial websites on the server. If the DB or Prisma client fails
  // (e.g. missing DATABASE_URL), don't throw — fall back to empty list so
  // the route can render and avoid a 500/404 during server rendering.
  let initialWebsites: Website[] = [];
  try {
    initialWebsites = await searchWebsites("");
  } catch (err) {
    // Log and continue with an empty list to keep the route healthy.
    console.error("searchWebsites failed during server render:", err);
    initialWebsites = [];
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold">SEO Directory Finder</h1>

        <div className="flex gap-6">
          <a href="#">Features</a>
          <a href="#">Directory</a>
          <a href="#">Pricing</a>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 border rounded-lg">Login</button>
          <button className="px-4 py-2 bg-black text-white rounded-lg dark:bg-white dark:text-black">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero + Directory — client-managed */}
      <HomepageClient initialWebsites={initialWebsites} />
    </main>
  );
}
