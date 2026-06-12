import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { discoverWebsites } from "@/services/discoveryService";
import { Website } from "@/types/website";
import ResultsTable from "@/components/ResultsTable";
import DashboardStats from "@/components/DashboardStats";

// ─── Known industries ─────────────────────────────────────────────────────────
// Add new entries here — generateStaticParams will pre-render them at build time.

const INDUSTRIES: Record<string, string> = {
  "general-business": "General Business",
  technology:         "Technology",
  healthcare:         "Healthcare",
  "real-estate":      "Real Estate",
  finance:            "Finance",
  education:          "Education",
  marketing:          "Marketing",
  legal:              "Legal",
};

function slugToLabel(slug: string): string {
  return INDUSTRIES[slug] ?? "";
}

function mapToWebsite(
  result: { url: string; title: string },
  index: number
): Website {
  return {
    id: `industry-${index}`,
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

// ─── Static params — pre-render all known industry pages at build time ────────

export function generateStaticParams() {
  return Object.keys(INDUSTRIES).map((industry) => ({ industry }));
}

// ─── Dynamic metadata ─────────────────────────────────────────────────────────

export async function generateMetadata(
  props: { params: Promise<{ industry: string }> }
): Promise<Metadata> {
  const { industry } = await props.params;
  const label = slugToLabel(industry);

  if (!label) {
    return { title: "Industry Not Found — SEO Directory Finder" };
  }

  return {
    title: `${label} Directories — SEO Directory Finder`,
    description: `Browse high-quality ${label.toLowerCase()} listing websites with strong domain authority and low spam scores.`,
    openGraph: {
      title: `${label} Directories — SEO Directory Finder`,
      description: `Discover the best ${label.toLowerCase()} directories for SEO link building and business listings.`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function IndustryPage(
  props: { params: Promise<{ industry: string }> }
) {
  const { industry } = await props.params;
  const label = slugToLabel(industry);

  // Unknown slug → 404
  if (!label) notFound();

  // Discover websites server-side for this industry
  let websites: Website[] = [];
  let error: string | null = null;

  try {
    const response = await discoverWebsites(
      `${label.toLowerCase()} directories`
    );
    websites = response.results.map(mapToWebsite);
  } catch (err) {
    error = err instanceof Error ? err.message : "Discovery failed.";
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

          {/* Breadcrumb */}
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-1.5 text-xs text-zinc-400 dark:text-zinc-500 min-w-0"
          >
            <Link
              href="/"
              className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              Home
            </Link>
            <span aria-hidden>/</span>
            <Link
              href="/industries"
              className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              Industries
            </Link>
            <span aria-hidden>/</span>
            <span className="text-zinc-600 dark:text-zinc-300 font-medium truncate">
              {label}
            </span>
          </nav>

          {/* Quick-nav to other industries (desktop only) */}
          <div className="hidden lg:flex items-center gap-1">
            {Object.entries(INDUSTRIES)
              .filter(([slug]) => slug !== industry)
              .slice(0, 4)
              .map(([slug, name]) => (
                <Link
                  key={slug}
                  href={`/industries/${slug}`}
                  className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors whitespace-nowrap"
                >
                  {name}
                </Link>
              ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Page heading */}
        <div>
          <div className="mb-2">
            <span className="inline-block px-2.5 py-1 rounded-full bg-zinc-100 dark:bg-zinc-900 text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wider">
              Industry
            </span>
          </div>

          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            {label} Directories
          </h1>

          <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
            Browse high-quality {label.toLowerCase()} listing websites with strong
            domain authority and low spam scores — ideal for SEO link building and
            business listings.
          </p>

          {/* Count badge */}
          {!error && (
            <div className="mt-4 inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">
              <svg
                className="w-4 h-4 text-blue-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064"
                />
              </svg>
              <span>
                <strong className="text-zinc-900 dark:text-zinc-100">
                  {websites.length}
                </strong>{" "}
                website{websites.length !== 1 ? "s" : ""} found
              </span>
            </div>
          )}
        </div>

        {/* Error state */}
        {error && (
          <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950 px-5 py-4 text-sm text-red-700 dark:text-red-400">
            {error}
          </div>
        )}

        {/* Dashboard stats */}
        {!error && websites.length > 0 && (
          <DashboardStats websites={websites} />
        )}

        {/* Results table */}
        {!error && websites.length > 0 && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950">
              <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                {label} Listing Sites
              </h2>
              <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                Sorted by relevance
              </p>
            </div>
            <ResultsTable websites={websites} />
          </div>
        )}

        {/* Empty state */}
        {!error && websites.length === 0 && (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-16 text-center">
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">
              No websites found for {label}.{" "}
              <Link href="/" className="text-blue-500 hover:underline">
                Try searching directly.
              </Link>
            </p>
          </div>
        )}

        {/* Related industries — internal linking for SEO */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
            Explore Other Industries
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {Object.entries(INDUSTRIES)
              .filter(([slug]) => slug !== industry)
              .map(([slug, name]) => (
                <Link
                  key={slug}
                  href={`/industries/${slug}`}
                  className="flex items-center gap-2 px-4 py-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-sm font-medium text-zinc-700 dark:text-zinc-300 hover:border-blue-300 dark:hover:border-blue-700 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-zinc-300 dark:bg-zinc-600 group-hover:bg-blue-500 transition-colors shrink-0" />
                  {name}
                </Link>
              ))}
          </div>
        </div>
      </main>
    </div>
  );
}
