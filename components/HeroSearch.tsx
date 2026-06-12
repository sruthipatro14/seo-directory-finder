"use client";

import { useState } from "react";
import { Website } from "@/types/website";
import { searchWebsites } from "@/app/actions/search";

interface HeroSearchProps {
  onResults: (websites: Website[]) => void;
  onSearchStart: () => void;
}

export default function HeroSearch({ onResults, onSearchStart }: HeroSearchProps) {
  const [query, setQuery]     = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState<string | null>(null);

  async function handleSearch() {
    if (!query.trim()) return;
    setLoading(true);
    setError(null);
    onSearchStart();

    const { websites, error } = await searchWebsites(query.trim());

    setLoading(false);
    if (error) {
      setError(error);
    } else {
      onResults(websites);
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") handleSearch();
  }

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="flex flex-col md:flex-row gap-4 justify-center w-full">
        <div className="relative w-full md:w-[500px]">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Search business listing sites..."
            disabled={loading}
            className="border rounded-lg px-4 py-3 w-full pr-10 disabled:opacity-50 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-black dark:focus:ring-white transition-colors"
          />
          {loading && (
            <div className="absolute inset-y-0 right-3 flex items-center pointer-events-none">
              <svg
                className="w-4 h-4 animate-spin text-zinc-400"
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
            </div>
          )}
        </div>

        <button
          onClick={handleSearch}
          disabled={loading || !query.trim()}
          className="bg-black text-white px-6 py-3 rounded-lg dark:bg-white dark:text-black disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90 transition-opacity"
        >
          {loading ? "Searching…" : "Analyze Websites"}
        </button>
      </div>

      {error && (
        <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
      )}
    </div>
  );
}
