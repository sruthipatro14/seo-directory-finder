'use client'

import { useState } from "react";
import { Website } from "@/types/website";
import FilterSidebar from "@/components/FilterSidebar";
import ResultsTable from "@/components/ResultsTable";
import DashboardStats from "@/components/DashboardStats";

export interface FilterState {
  daLow: boolean;
  daAverage: boolean;
  daExcellent: boolean;
  freeListingOnly: boolean;
  spamBelow5: boolean;
  industry: string;
}

const defaultFilters: FilterState = {
  daLow: false,
  daAverage: false,
  daExcellent: false,
  freeListingOnly: false,
  spamBelow5: false,
  industry: "All Industries",
};

type SortOption =
  | "rank-asc"
  | "da-desc"
  | "da-asc"
  | "spam-asc"
  | "spam-desc"
  | "name-asc"
  | "newest"
  | "oldest";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "rank-asc",  label: "Google Rank" },
  { value: "da-desc",   label: "Highest DA" },
  { value: "da-asc",    label: "Lowest DA" },
  { value: "spam-asc",  label: "Lowest Spam Score" },
  { value: "spam-desc", label: "Highest Spam Score" },
  { value: "name-asc",  label: "Website Name A–Z" },
  { value: "newest",    label: "Newest" },
  { value: "oldest",    label: "Oldest" },
];

function sortWebsites(websites: Website[], sort: SortOption, query: string = ""): Website[] {
  const copy = [...websites];
  const normalisedQuery = query.toLowerCase().trim();

  switch (sort) {
    case "rank-asc":  
      return copy.sort((a, b) => {
        // 1. Industry-specific priority
        const aRel = a.industry.toLowerCase().includes(normalisedQuery) ? 0 : 1;
        const bRel = b.industry.toLowerCase().includes(normalisedQuery) ? 0 : 1;
        if (aRel !== bRel) return aRel - bRel;

        // 2. Google Rank
        const diff = (a.rankPosition || 999) - (b.rankPosition || 999);
        return diff !== 0 ? diff : b.domainAuthority - a.domainAuthority;
      });
    case "da-desc":   return copy.sort((a, b) => b.domainAuthority - a.domainAuthority);
    case "da-asc":    return copy.sort((a, b) => a.domainAuthority - b.domainAuthority);
    case "spam-asc":  return copy.sort((a, b) => a.spamScore - b.spamScore);
    case "spam-desc": return copy.sort((a, b) => b.spamScore - a.spamScore);
    case "name-asc":  return copy.sort((a, b) => a.name.localeCompare(b.name));
    case "newest":    return copy.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    case "oldest":    return copy.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
    default:          return copy;
  }
}

// Wraps a cell value in quotes and escapes any internal quotes (RFC 4180)
function csvCell(value: string | number | boolean): string {
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function exportToCsv(websites: Website[]): void {
  const headers = [
    "Directory Name",
    "Add Listing URL",
    "Free/Paid",
    "Category",
    "Domain Authority",
    "Spam Score",
  ];

  const rows = websites.map((site) => [
    csvCell(site.name),
    csvCell(site.submissionUrl || site.url),
    csvCell(site.freeListing ? "Free" : "Paid"),
    csvCell(site.industry),
    csvCell(site.domainAuthority),
    csvCell(site.spamScore),
  ]);

  const csv = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url  = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href     = url;
  link.download = `seo-directory-${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

interface DirectorySectionProps {
  websites: Website[];
}

export default function DirectorySection({ websites }: DirectorySectionProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);
  const [query, setQuery]     = useState("");
  const [sort, setSort]       = useState<SortOption>("rank-asc");

  const normalised = query.trim().toLowerCase();

  const filteredWebsites = websites.filter((site) => {
    // Search — name, industry, url
    if (normalised) {
      const matchesSearch =
        site.name.toLowerCase().includes(normalised) ||
        site.industry.toLowerCase().includes(normalised) ||
        site.url.toLowerCase().includes(normalised);
      if (!matchesSearch) return false;
    }

    // Domain Authority — if none checked, all pass; if any checked, site must match one
    const daChecked = filters.daLow || filters.daAverage || filters.daExcellent;
    if (daChecked) {
      const daMatch =
        (filters.daLow      && site.domainAuthority >= 1  && site.domainAuthority <= 20)  ||
        (filters.daAverage   && site.domainAuthority >= 21 && site.domainAuthority <= 50)  ||
        (filters.daExcellent && site.domainAuthority >= 51 && site.domainAuthority <= 100);
      if (!daMatch) return false;
    }

    // Free listing
    if (filters.freeListingOnly && !site.freeListing) return false;

    // Spam score
    if (filters.spamBelow5 && site.spamScore >= 5) return false;

    // Industry
    if (filters.industry !== "All Industries" && site.industry !== filters.industry) return false;

    return true;
  });

  // Reverted to previous stable sorting logic
  const sortedWebsites = sortWebsites(filteredWebsites, sort, normalised);

  if (websites.length > 0) {
    console.log(`Active filters returned ${filteredWebsites.length} of ${websites.length} records.`);
  }

  return (
    <section className="max-w-6xl mx-auto px-8 pb-24 bg-slate-900 text-slate-50">
      {/* Header row — title + search input */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-slate-50">
          {normalised && (
            <span className="ml-3 text-sm font-normal text-slate-400">
              {filteredWebsites.length} result{filteredWebsites.length !== 1 ? "s" : ""} for &ldquo;{query.trim()}&rdquo;
            </span>
          )}
        </h2>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <svg
              className="h-4 w-4 text-slate-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z" />
            </svg>
          </div>
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, industry, URL…"
            className="w-full rounded-xl border border-slate-700 bg-slate-800 pl-9 pr-8 py-2 text-sm text-slate-300 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 transition-colors shadow-sm"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-2.5 flex items-center text-slate-400 hover:text-slate-200 transition-colors duration-150"
              aria-label="Clear search"
            >
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          )}
        </div>
      </div>

      {/* Stats — reflects currently filtered websites */}
      <div className="mb-8">
        <DashboardStats websites={filteredWebsites} />
      </div>

      <div className="flex flex-col md:flex-row gap-6 items-start">
        {/* Left — FilterSidebar ~25% */}
        <div className="w-full md:w-1/4">
          <FilterSidebar onFilterChange={setFilters} />
        </div>

        {/* Right — toolbar + ResultsTable */}
        <div className="w-full md:w-3/4 flex flex-col gap-3">
          {/* Toolbar: sort pills + export button */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-widest whitespace-nowrap">
                Sort by
              </span>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors duration-200 whitespace-nowrap ${
                      sort === opt.value
                        ? "bg-blue-600 text-white"
                        : "bg-slate-800 border border-slate-700 text-slate-300 hover:border-blue-600 hover:text-blue-400 shadow-sm"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Export CSV */}
            <button
              onClick={() => exportToCsv(sortedWebsites)}
              disabled={sortedWebsites.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border border-slate-700 bg-slate-800 text-slate-300 hover:border-emerald-500 hover:text-emerald-400 transition-colors duration-200 shadow-sm disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
              <span className="text-slate-500">
                ({sortedWebsites.length})
              </span>
            </button>
          </div>

          <div className="mt-8">
            <ResultsTable websites={sortedWebsites} />
          </div>
        </div>
      </div>
    </section>
  );
}
