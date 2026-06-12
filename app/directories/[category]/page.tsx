import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { Website } from "@/types/website";
import ResultsTable from "@/components/ResultsTable";
import DashboardStats from "@/components/DashboardStats";

// ─── Category config ──────────────────────────────────────────────────────────

type DaCategory = "Low" | "Average" | "Excellent";

interface CategoryConfig {
  label: string;
  daCategory: DaCategory;
  daMin: number;
  daMax: number;
  description: string;
  accent: {
    badge: string;
    bar: string;
    heading: string;
  };
}

const CATEGORIES: Record<string, CategoryConfig> = {
  "low-authority": {
    label:      "Low Authority",
    daCategory: "Low",
    daMin:      1,
    daMax:      20,
    description:
      "Business listing websites with domain authority between 1 and 20. Ideal for new sites building their backlink profile in less competitive niches.",
    accent: {
      badge:   "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
      bar:     "bg-red-500",
      heading: "text-red-600 dark:text-red-400",
    },
  },
  "average-authority": {
    label:      "Average Authority",
    daCategory: "Average",
    daMin:      21,
    daMax:      50,
    description:
      "Business listing websites with domain authority between 21 and 50. A solid mid-tier choice for diverse, balanced link building.",
    accent: {
      badge:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
      bar:     "bg-yellow-500",
      heading: "text-yellow-600 dark:text-yellow-400",
    },
  },
  "excellent-authority": {
    label:      "Excellent Authority",
    daCategory: "Excellent",
    daMin:      51,
    daMax:      100,
    description:
      "Business listing websites with domain authority between 51 and 100. High-value backlink sources trusted by search engines.",
    accent: {
      badge:   "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
      bar:     "bg-green-500",
      heading: "text-green-600 dark:text-green-400",
    },
  },
};

// ─── Mock website data ────────────────────────────────────────────────────────
// TODO: replace with getAllWebsites() from @/services/websiteService

const ALL_WEBSITES: Website[] = [
  { id: "1",  name: "Justdial",        url: "https://justdial.com",        domainAuthority: 88, spamScore: 2, freeListing: true,  industry: "General Business", daCategory: "Excellent", active: true  },
  { id: "2",  name: "Sulekha",         url: "https://sulekha.com",         domainAuthority: 75, spamScore: 1, freeListing: true,  industry: "Services",         daCategory: "Excellent", active: true  },
  { id: "3",  name: "IndiaMart",       url: "https://indiamart.com",       domainAuthority: 70, spamScore: 3, freeListing: true,  industry: "Technology",       daCategory: "Excellent", active: true  },
  { id: "4",  name: "HealthGrades",    url: "https://healthgrades.com",    domainAuthority: 68, spamScore: 4, freeListing: false, industry: "Healthcare",       daCategory: "Excellent", active: true  },
  { id: "5",  name: "Zillow",          url: "https://zillow.com",          domainAuthority: 91, spamScore: 1, freeListing: false, industry: "Real Estate",      daCategory: "Excellent", active: true  },
  { id: "6",  name: "Bankrate",        url: "https://bankrate.com",        domainAuthority: 82, spamScore: 2, freeListing: false, industry: "Finance",          daCategory: "Excellent", active: true  },
  { id: "7",  name: "Coursera",        url: "https://coursera.org",        domainAuthority: 89, spamScore: 1, freeListing: false, industry: "Education",        daCategory: "Excellent", active: true  },
  { id: "8",  name: "HubSpot",         url: "https://hubspot.com",         domainAuthority: 93, spamScore: 1, freeListing: true,  industry: "Marketing",        daCategory: "Excellent", active: true  },
  { id: "9",  name: "LegalZoom",       url: "https://legalzoom.com",       domainAuthority: 72, spamScore: 6, freeListing: false, industry: "Legal",            daCategory: "Excellent", active: true  },
  { id: "10", name: "LocalBusiness",   url: "https://localbusiness.com",   domainAuthority: 35, spamScore: 8, freeListing: true,  industry: "General Business", daCategory: "Average",   active: true  },
  { id: "11", name: "SmallBizConnect", url: "https://smallbizconnect.com", domainAuthority: 18, spamScore: 3, freeListing: true,  industry: "General Business", daCategory: "Low",       active: false },
  { id: "12", name: "BizDirectory",    url: "https://bizdirectory.com",    domainAuthority: 12, spamScore: 4, freeListing: true,  industry: "General Business", daCategory: "Low",       active: true  },
  { id: "13", name: "MidRankSites",    url: "https://midranksites.com",    domainAuthority: 42, spamScore: 2, freeListing: true,  industry: "Technology",       daCategory: "Average",   active: true  },
  { id: "14", name: "TrustBizList",    url: "https://trustbizlist.com",    domainAuthority: 38, spamScore: 3, freeListing: false, industry: "Finance",          daCategory: "Average",   active: true  },
];

// ─── Static params ────────────────────────────────────────────────────────────

export function generateStaticParams() {
  return Object.keys(CATEGORIES).map((category) => ({ category }));
}

// ─── Metadata ─────────────────────────────────────────────────────────────────

export async function generateMetadata(
  props: { params: Promise<{ category: string }> }
): Promise<Metadata> {
  const { category } = await props.params;
  const config = CATEGORIES[category];

  if (!config) {
    return { title: "Not Found — SEO Directory Finder" };
  }

  const { label, daMin, daMax, description } = config;

  return {
    title: `${label} Directories (DA ${daMin}–${daMax}) — SEO Directory Finder`,
    description,
    openGraph: {
      title: `${label} Business Directories — SEO Directory Finder`,
      description: `Find business listing websites with ${label.toLowerCase()} domain authority (DA ${daMin}–${daMax}) for targeted SEO link building.`,
    },
  };
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default async function AuthorityCategoryPage(
  props: { params: Promise<{ category: string }> }
) {
  const { category } = await props.params;
  const config = CATEGORIES[category];

  if (!config) notFound();

  const { label, daMin, daMax, description, accent } = config;

  // Filter active websites by DA range server-side
  const websites = ALL_WEBSITES.filter(
    (site) =>
      site.active &&
      site.domainAuthority >= daMin &&
      site.domainAuthority <= daMax
  );

  const otherCategories = Object.entries(CATEGORIES).filter(
    ([slug]) => slug !== category
  );

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
              href="/directories"
              className="hover:text-zinc-700 dark:hover:text-zinc-300 transition-colors"
            >
              Directories
            </Link>
            <span aria-hidden>/</span>
            <span className="text-zinc-600 dark:text-zinc-300 font-medium truncate">
              {label}
            </span>
          </nav>

          {/* Sibling category quick-nav */}
          <div className="hidden md:flex items-center gap-1">
            {otherCategories.map(([slug, cfg]) => (
              <Link
                key={slug}
                href={`/directories/${slug}`}
                className="px-2.5 py-1 rounded-lg text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors whitespace-nowrap"
              >
                {cfg.label}
              </Link>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Page heading */}
        <div>
          <div className="mb-3">
            <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider ${accent.badge}`}>
              DA {daMin}–{daMax}
            </span>
          </div>

          <h1 className="text-4xl font-bold text-zinc-900 dark:text-zinc-100">
            {label} Directories
          </h1>

          <p className="text-zinc-500 dark:text-zinc-400 mt-2 max-w-2xl">
            {description}
          </p>

          {/* Badges row */}
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">
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
                website{websites.length !== 1 ? "s" : ""}
              </span>
            </div>

            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-sm text-zinc-600 dark:text-zinc-400">
              <svg
                className="w-4 h-4 text-zinc-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
                />
              </svg>
              Domain Authority {daMin}–{daMax}
            </div>
          </div>
        </div>

        {/* DA range visualiser */}
        <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
              Domain Authority Range
            </span>
            <span className={`text-sm font-bold ${accent.heading}`}>
              {daMin} – {daMax}
            </span>
          </div>
          <div className="w-full h-2 rounded-full bg-zinc-100 dark:bg-zinc-800 overflow-hidden">
            <div
              className={`h-2 rounded-full ${accent.bar}`}
              style={{
                marginLeft: `${daMin}%`,
                width: `${daMax - daMin}%`,
              }}
            />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-xs text-zinc-400">0</span>
            <span className="text-xs text-zinc-400">100</span>
          </div>
        </div>

        {/* Stats */}
        {websites.length > 0 && <DashboardStats websites={websites} />}

        {/* Results table */}
        {websites.length > 0 ? (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
            <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800 bg-white dark:bg-zinc-950 flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
                  {label} Listing Sites
                </h2>
                <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                  Domain authority {daMin}–{daMax}
                </p>
              </div>
              <span className={`inline-block px-2.5 py-1 rounded-full text-xs font-semibold ${accent.badge}`}>
                {websites.length} site{websites.length !== 1 ? "s" : ""}
              </span>
            </div>
            <ResultsTable websites={websites} />
          </div>
        ) : (
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-16 text-center">
            <p className="text-zinc-400 dark:text-zinc-500 text-sm">
              No websites found in this DA range.{" "}
              <Link href="/" className="text-blue-500 hover:underline">
                Try searching directly.
              </Link>
            </p>
          </div>
        )}

        {/* Cross-links to sibling authority pages */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
            Browse by Authority
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {otherCategories.map(([slug, cfg]) => (
              <Link
                key={slug}
                href={`/directories/${slug}`}
                className="flex items-center justify-between px-5 py-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-blue-300 dark:hover:border-blue-700 transition-colors group"
              >
                <div>
                  <p className="text-sm font-semibold text-zinc-800 dark:text-zinc-200 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {cfg.label} Directories
                  </p>
                  <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
                    DA {cfg.daMin}–{cfg.daMax}
                  </p>
                </div>
                <svg
                  className="w-4 h-4 text-zinc-400 group-hover:text-blue-500 transition-colors shrink-0"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={2}
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
