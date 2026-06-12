import type { Metadata } from "next";
import Link from "next/link";
import { discoverWebsites } from "@/services/discoveryService";
import { Website } from "@/types/website";
import DirectorySection from "@/components/DirectorySection";

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  props: { searchParams: Promise<{ keyword?: string }> }
): Promise<Metadata> {
  const { keyword } = await props.searchParams;
  const label = keyword ? keyword.replace(/-/g, " ") : "Directory Search";
  return {
    title: `${label} — SEO Directory Finder`,
    description: `Browse discovered websites for "${label}".`,
  };
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function slugToKeyword(slug: string): string {
  return slug.replace(/-/g, " ").trim();
}

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

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function DirectoriesPage(
  props: { searchParams: Promise<{ keyword?: string }> }
) {
  const { keyword: rawKeyword } = await props.searchParams;
  const keyword = rawKeyword ? slugToKeyword(rawKeyword) : "";

  // Run discovery server-side — empty when no keyword provided
  let websites: Website[] = [];
  let error: string | null = null;

  if (keyword) {
    try {
      const response = await discoverWebsites(keyword);
      websites = response.results.map(mapToWebsite);
    } catch (err) {
      error = err instanceof Error ? err.message : "Discovery failed.";
    }
  }

  return (
    <div className="min-h-screen bg-white dark:bg-black">
      {/* Sticky top bar */}
      <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between gap-4">
          <Link
            href="/"
            className="text-sm font-semibold text-zinc-900 dark:text-zinc-100 hover:opacity-70 transition-opacity whitespace-nowrap"
          >
            ← SEO Directory Finder
          </Link>

          {keyword && (
            <div className="flex items-center gap-2 min-w-0">
              <span className="text-xs text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                Results for
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-sm font-medium text-zinc-800 dark:text-zinc-200 truncate">
                <svg
                  className="w-3.5 h-3.5 text-zinc-400 shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
                  />
                </svg>
                {keyword}
              </span>
            </div>
          )}

          <Link
            href="/"
            className="text-xs font-medium text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 transition-colors whitespace-nowrap"
          >
            New search
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        {/* Page heading */}
        <div className="mb-8">
          {keyword ? (
            <>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 capitalize">
                {keyword}
              </h1>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1.5">
                {error
                  ? "Something went wrong during discovery."
                  : `${websites.length} website${websites.length !== 1 ? "s" : ""} discovered`}
              </p>
            </>
          ) : (
            <>
              <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
                Directory Search
              </h1>
              <p className="text-sm text-zinc-400 dark:text-zinc-500 mt-1.5">
                No keyword provided.{" "}
                <Link href="/" className="text-blue-500 hover:underline">
                  Go back and search.
                </Link>
              </p>
            </>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-5 py-4 text-sm text-red-700 dark:text-red-400 mb-8">
            {error}
          </div>
        )}

        {/* Results — DirectorySection brings filters, sort, stats, and CSV */}
        {!error && keyword && websites.length > 0 && (
          <DirectorySection websites={websites} />
        )}

        {/* Empty state — keyword given but nothing returned */}
        {!error && keyword && websites.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-16 text-center">
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">
              No websites found for &ldquo;{keyword}&rdquo;.{" "}
              <Link href="/" className="text-blue-500 hover:underline">
                Try a different keyword.
              </Link>
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
