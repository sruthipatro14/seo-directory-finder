"use client";

import { useState } from "react";
import { Website } from "@/types/website";
import HeroSearch from "@/components/HeroSearch";
import DirectorySection from "@/components/DirectorySection";

interface HomepageClientProps {
  initialWebsites: Website[];
}

export default function HomepageClient({ initialWebsites }: HomepageClientProps) {
  const [websites, setWebsites]       = useState<Website[]>(initialWebsites);
  const [isSearching, setIsSearching] = useState(false);

  return (
    <>
      {/* Hero */}
      <section className="max-w-5xl mx-auto px-8 py-24 text-center">
        <div className="inline-block px-4 py-2 rounded-full bg-zinc-100 dark:bg-zinc-900 mb-6">
          SEO Research Platform
        </div>

        <h1 className="text-5xl font-bold mb-6">
          Find High-Quality Business Listing Websites
        </h1>

        <p className="text-xl text-zinc-600 dark:text-zinc-400 mb-10">
          Discover free business listing websites with low spam scores,
          strong domain authority, and industry relevance.
        </p>

        <HeroSearch
          onSearchStart={() => setIsSearching(true)}
          onResults={(discovered) => {
            setWebsites(discovered);
            setIsSearching(false);
          }}
        />

        <div className="flex flex-wrap justify-center gap-4 mt-8 text-sm">
          <span>✅ Free Listings</span>
          <span>✅ Spam Score &lt; 5%</span>
          <span>✅ Industry Verified</span>
          <span>✅ DA Categorized</span>
        </div>
      </section>

      {/* Loading state */}
      {isSearching && (
        <div className="max-w-6xl mx-auto px-8 pb-8">
          <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-12 flex flex-col items-center gap-4">
            <svg
              className="w-8 h-8 animate-spin text-zinc-400"
              fill="none"
              viewBox="0 0 24 24"
            >
              <circle
                className="opacity-25"
                cx="12"
                cy="12"
                r="10"
                stroke="currentColor"
                strokeWidth="4"
              />
              <path
                className="opacity-75"
                fill="currentColor"
                d="M4 12a8 8 0 018-8v8z"
              />
            </svg>
            <p className="text-sm font-medium text-zinc-500 dark:text-zinc-400">
              Discovering websites…
            </p>
          </div>
        </div>
      )}

      {/* Directory — hidden while searching, updated after */}
      {!isSearching && (
        <DirectorySection websites={websites} />
      )}
    </>
  );
}
