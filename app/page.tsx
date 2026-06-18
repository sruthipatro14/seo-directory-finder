import HomepageClient from "@/components/HomepageClient";
import { searchWebsites } from "@/services/websiteService";
import type { Website } from "@prisma/client";
import Link from "next/link";

export default async function Home() {
  let initialWebsites: Website[] = [];

  try {
    initialWebsites = await searchWebsites("");
  } catch (err) {
    console.error("searchWebsites failed during server render:", err);
    initialWebsites = [];
  }

  return (
    <main className="min-h-screen bg-white dark:bg-black relative">
      <div className="flex justify-end p-4">
        <Link
          href="/da-checker"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          DA Checker
        </Link>
      </div>

      <HomepageClient initialWebsites={initialWebsites} />
    </main>
  );
}