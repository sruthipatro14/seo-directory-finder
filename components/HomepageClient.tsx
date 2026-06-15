"use client";

import React, { useState } from 'react';
import DashboardStats from '@/components/DashboardStats';
import ExportButton from '@/components/ExportButton';
import ResultsTable from '@/components/ResultsTable';
import type { Website } from '@prisma/client'; // import type to avoid bundling @prisma/client into client bundle
import { searchWebsitesAction, recordSearchAction } from '@/app/actions';

interface HomepageClientProps {
  initialWebsites: Website[];
}

export default function HomepageClient({ initialWebsites }: HomepageClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Website[]>(initialWebsites);
  const [source, setSource] = useState<string>("unknown");
  const [discoveredCount, setDiscoveredCount] = useState<number>(initialWebsites.length);
  const [savedCount, setSavedCount] = useState<number>(0);
  const [isFallback, setIsFallback] = useState<boolean>(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!searchTerm.trim()) return;

    setLoading(true);
    setError(null);
    try {
      console.log("Search started");
      console.log("UI: Starting discovery for", searchTerm);
      await recordSearchAction(searchTerm);

      const response = await searchWebsitesAction(searchTerm);
      setSearchResults(response.results);
      setIsFallback(response.isFallback);
      setSource(response.source);
      setDiscoveredCount(response.discovered);
      setSavedCount(response.saved);
      console.log("Results returned");
    } catch (err) {
      setError('Failed to perform search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
      console.log("Loading false");
    }
  };

  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12">
      {/* Search Input */}
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold tracking-tight">Find Your Next Directory</h2>
        <p className="text-lg text-zinc-500">Discover high-authority, low-spam directories for your niche.</p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto mt-6">
          <input
            type="text"
            placeholder="Enter an industry (e.g. Lawyers, Roofing)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Discovering...' : 'Discover'}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}

        {searchResults.length > 0 && (
          <div className="mt-6 rounded-2xl bg-zinc-50 dark:bg-zinc-950 p-4 text-left border border-zinc-200 dark:border-zinc-800">
            <p className="text-sm text-zinc-500">Discovery source: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{source}</span></p>
            <p className="text-sm text-zinc-500">URLs discovered: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{discoveredCount}</span></p>
            <p className="text-sm text-zinc-500">URLs saved: <span className="text-zinc-900 dark:text-zinc-100 font-semibold">{savedCount}</span></p>
            {isFallback && (
              <p className="text-sm text-yellow-600 dark:text-yellow-400 font-semibold mt-1">⚠️ Operating in Fallback/Mock mode</p>
            )}
            <div className="flex justify-end mt-4">
              <ExportButton
                data={searchResults}
                filename={`discovered-websites-${searchTerm.trim() || 'results'}.xlsx`}
              />
            </div>
          </div>
        )}
      </section>

      {/* Stats and Results */}
      <section>
        <DashboardStats websites={searchResults} />
        <ResultsTable websites={searchResults} />
      </section>
    </div>
  );
}