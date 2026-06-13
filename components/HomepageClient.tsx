'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { Website } from '@prisma/client'; // Assuming Website type is directly from Prisma client
import { searchWebsitesAction, recordSearchAction } from '@/app/actions';

// Placeholder for DashboardStats and ResultsTable components
// In a real app, these would be separate, more complex components.
function DashboardStats({ websites }: { websites: Website[] }) {
  const totalWebsites = websites.length;
  const averageDA = totalWebsites > 0 ? (websites.reduce((sum, w) => sum + w.domainAuthority, 0) / totalWebsites).toFixed(1) : '0.0';
  const freeListingCount = websites.filter(w => w.freeListing).length;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 p-4 bg-zinc-50 dark:bg-zinc-950 rounded-lg border border-zinc-200 dark:border-zinc-800">
      <div className="text-center">
        <div className="text-sm text-zinc-500">Total Results</div>
        <div className="text-xl font-bold">{totalWebsites}</div>
      </div>
      <div className="text-center">
        <div className="text-sm text-zinc-500">Avg. DA</div>
        <div className="text-xl font-bold">{averageDA}</div>
      </div>
      <div className="text-center">
        <div className="text-sm text-zinc-500">Free Listing</div>
        <div className="text-xl font-bold">{freeListingCount}</div>
      </div>
    </div>
  );
}

function ResultsTable({ websites }: { websites: Website[] }) {
  if (websites.length === 0) {
    return <p className="text-center text-zinc-500 mt-8">No websites found for your search.</p>;
  }

  return (
    <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm mt-8">
      <table className="w-full text-left text-sm">
        <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
          <tr>
            <th className="px-4 py-3 font-semibold">Website</th>
            <th className="px-4 py-3 font-semibold">Industry</th>
            <th className="px-4 py-3 font-semibold text-right">DA</th>
            <th className="px-4 py-3 font-semibold text-center">Free</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {websites.map((site) => (
            <tr key={site.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
              <td className="px-4 py-4">
                <a href={site.url} target="_blank" rel="noopener noreferrer" className="font-medium text-blue-600 dark:text-blue-400 hover:underline">
                  {site.name}
                </a>
                <div className="text-xs text-zinc-500 truncate max-w-[200px]">{site.url}</div>
              </td>
              <td className="px-4 py-4 capitalize">{site.industry}</td>
              <td className="px-4 py-4 text-right">
                <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs">
                  {site.domainAuthority}
                </span>
              </td>
              <td className="px-4 py-4 text-center">
                {site.freeListing ? (
                  <span className="text-green-500">✓</span>
                ) : (
                  <span className="text-red-500">✗</span>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

interface HomepageClientProps {
  initialWebsites: Website[];
}

export default function HomepageClient({ initialWebsites }: HomepageClientProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [searchResults, setSearchResults] = useState<Website[]>(initialWebsites);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    e?.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Save search term to history
      if (searchTerm.trim()) {
        await recordSearchAction(searchTerm);
      }
      
      const results = await searchWebsitesAction(searchTerm);
      setSearchResults(results);
    } catch (err) {
      setError('Failed to perform search. Please try again.');
      console.error('Search error:', err);
    } finally {
      setLoading(false);
    }
  };

  const debouncedSearchTerm = useMemo(() => searchTerm, [searchTerm]);

  // Optional: Debounce search for a more responsive feel without hitting DB too hard
  // useEffect(() => {
  //   const handler = setTimeout(() => {
  //     if (debouncedSearchTerm.length > 2 || debouncedSearchTerm.length === 0) {
  //       handleSearch();
  //     }
  //   }, 300); // 300ms debounce

  //   return () => {
  //     clearTimeout(handler);
  //   };
  // }, [debouncedSearchTerm]);


  return (
    <div className="max-w-7xl mx-auto p-8 space-y-12">
      {/* Search Input */}
      <section className="text-center space-y-4">
        <h2 className="text-4xl font-extrabold tracking-tight">Find Your Next Directory</h2>
        <p className="text-lg text-zinc-500">Discover high-authority, low-spam directories for your niche.</p>
        <form onSubmit={handleSearch} className="flex gap-2 max-w-lg mx-auto mt-6">
          <input
            type="text"
            placeholder="Search by keyword, industry, or URL..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-grow px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Searching...' : 'Search'}
          </button>
        </form>
        {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
      </section>

      {/* Stats and Results */}
      <section>
        <DashboardStats websites={searchResults} />
        <ResultsTable websites={searchResults} />
      </section>
    </div>
  );
}