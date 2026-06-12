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
  | "da-desc"
  | "da-asc"
  | "spam-asc"
  | "spam-desc"
  | "name-asc";

const SORT_OPTIONS: { value: SortOption; label: string }[] = [
  { value: "da-desc",   label: "Highest DA" },
  { value: "da-asc",    label: "Lowest DA" },
  { value: "spam-asc",  label: "Lowest Spam Score" },
  { value: "spam-desc", label: "Highest Spam Score" },
  { value: "name-asc",  label: "Website Name A–Z" },
];

function sortWebsites(websites: Website[], sort: SortOption): Website[] {
  const copy = [...websites];
  switch (sort) {
    case "da-desc":   return copy.sort((a, b) => b.domainAuthority - a.domainAuthority);
    case "da-asc":    return copy.sort((a, b) => a.domainAuthority - b.domainAuthority);
    case "spam-asc":  return copy.sort((a, b) => a.spamScore - b.spamScore);
    case "spam-desc": return copy.sort((a, b) => b.spamScore - a.spamScore);
    case "name-asc":  return copy.sort((a, b) => a.name.localeCompare(b.name));
  }
}

// Wraps a cell value in quotes and escapes any internal quotes (RFC 4180)
function csvCell(value: string | number | boolean): string {
  const str = String(value);
  return `"${str.replace(/"/g, '""')}"`;
}

function exportToCsv(websites: Website[]): void {
  const headers = [
    "Website Name",
    "URL",
    "Domain Authority",
    "DA Category",
    "Spam Score",
    "Free Listing",
    "Industry",
  ];

  const rows = websites.map((site) => [
    csvCell(site.name),
    csvCell(site.url),
    csvCell(site.domainAuthority),
    csvCell(site.daCategory),
    csvCell(site.spamScore),
    csvCell(site.freeListing ? "Yes" : "No"),
    csvCell(site.industry),
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
  const [sort, setSort]       = useState<SortOption>("da-desc");

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

  // Sort is applied after filtering — stats always reflect filtered counts, not sort order
  const sortedWebsites = sortWebsites(filteredWebsites, sort);

  return (
    <section className="max-w-6xl mx-auto px-8 pb-24">
      {/* Header row — title + search input */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <h2 className="text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Directory Results
          {normalised && (
            <span className="ml-3 text-sm font-normal text-zinc-400 dark:text-zinc-500">
              {filteredWebsites.length} result{filteredWebsites.length !== 1 ? "s" : ""} for &ldquo;{query.trim()}&rdquo;
            </span>
          )}
        </h2>

        {/* Search input */}
        <div className="relative w-full sm:w-72">
          <div className="pointer-events-none absolute inset-y-0 left-3 flex items-center">
            <svg
              className="h-4 w-4 text-zinc-400"
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
            className="w-full rounded-lg border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 pl-9 pr-8 py-2 text-sm text-zinc-700 dark:text-zinc-300 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-colors"
          />
          {query && (
            <button
              onClick={() => setQuery("")}
              className="absolute inset-y-0 right-2.5 flex items-center text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-300 transition-colors"
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
      <div className="mb-6">
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
              <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest whitespace-nowrap">
                Sort by
              </span>
              <div className="flex flex-wrap gap-2">
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => setSort(opt.value)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors whitespace-nowrap ${
                      sort === opt.value
                        ? "bg-blue-600 text-white"
                        : "bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-400 hover:border-blue-400 hover:text-blue-600 dark:hover:text-blue-400"
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
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-green-500 hover:text-green-600 dark:hover:text-green-400 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              Export CSV
              <span className="text-zinc-400 dark:text-zinc-500">
                ({sortedWebsites.length})
              </span>
            </button>
          </div>

          <ResultsTable websites={sortedWebsites} />
        </div>
      </div>
    </section>
  );
}
