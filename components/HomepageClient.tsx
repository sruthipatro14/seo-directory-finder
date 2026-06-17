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
      // Reverted to broader query that successfully returns results
      const citationQuery = `best ${searchTerm} business directories citation sites`;
      
      console.log("Search started with citation intent:", citationQuery);
      await recordSearchAction(citationQuery);

      // Mode is now locked to 'directory' for Citation Finder intent
      const response = await searchWebsitesAction(citationQuery); // Removed 'directory' parameter

      console.log("--- Discovery Pipeline Debug ---");
      console.log(`1. Search results fetched: ${response.discovered}`);
      console.log(`2. URLs classified/saved: ${response.saved}`);
      console.log(`3. Raw results from API: ${response.results.length}`);

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
    <div className="min-h-screen bg-slate-900 text-slate-50 max-w-7xl mx-auto p-8 space-y-12">
      {/* Search Section */}
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold tracking-tight text-slate-50">Citation Finder</h2>
        <p className="text-lg text-slate-300">Find the best directories to submit your business listing and boost local SEO.</p>

        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto mt-6">
          <input
            type="text"
            placeholder="Enter an industry (e.g. Lawyers, Roofing)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow px-4 py-2 rounded-xl border border-slate-700 bg-slate-800 text-slate-50 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 shadow-sm"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-slate-50 rounded-xl font-medium hover:bg-blue-700 transition-colors duration-200 shadow-md disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Discovering...' : 'Discover'}
          </button>
        </form>
        {error && <p className="text-red-400 text-sm mt-2">{error}</p>}

        {searchResults.length > 0 && (
          <div className="mt-6 rounded-xl bg-slate-800 p-4 text-left border border-slate-700 shadow-sm">
            <p className="text-sm text-slate-400">Discovery source: <span className="text-slate-50 font-semibold">{source}</span></p>
            <p className="text-sm text-slate-400">URLs discovered: <span className="text-slate-50 font-semibold">{discoveredCount}</span></p>
            <p className="text-sm text-slate-400">URLs saved: <span className="text-slate-50 font-semibold">{savedCount}</span></p>
            {isFallback && (
              <p className="text-sm text-yellow-400 font-semibold mt-1">⚠️ Operating in Fallback/Mock mode</p>
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
        <div className="mb-8">
          <DashboardStats websites={searchResults} />
        </div>
        <div className="mt-8">
          <ResultsTable websites={searchResults} />
        </div>
      </section>
    </div>
  );
}