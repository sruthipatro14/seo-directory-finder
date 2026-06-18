'use client';

import { useState } from 'react';
import { bulkDaSpamCheck } from "../actions/domainMetrics";

interface CheckerResult {
  url: string;
  domainAuthority: number | null;
  spamScore: number | null;
  status: string;
}

export default function DACheckerClient() {
  const [urlsInput, setUrlsInput] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [results, setResults] = useState<CheckerResult[]>([]);

  const mockData: CheckerResult[] = [
    {
      url: "https://yelp.com",
      domainAuthority: 93,
      spamScore: 1,
      status: "Success"
    },
    {
      url: "https://brownbook.net",
      domainAuthority: 64,
      spamScore: 3,
      status: "Success"
    }
  ];

  const handleCheckMetrics = async () => {
    setLoading(true);
    setResults([]);

    const urls = [
      ...new Set(
        urlsInput
          .split("\n")
          .map(url => url.trim())
          .filter(Boolean)
      )
    ];

    const MAX_URLS = 100;

    if (urls.length > MAX_URLS) {
      alert(`Maximum ${MAX_URLS} URLs at a time`);
      setLoading(false);
      return;
    }

    const validUrls = urls.filter(url => {
      try {
        new URL(url.startsWith("http") ? url : `https://${url}`);
        return true;
      } catch {
        return false;
      }
    });

    console.log("Valid URLs:", validUrls.length);
    console.table(validUrls);

    if (validUrls.length > 0) {
      const apiResults = await bulkDaSpamCheck(validUrls);
      setResults(apiResults.map(r => ({
        url: r.url,
        domainAuthority: r.domainAuthority,
        spamScore: r.spamScore,
        status: r.success ? "Success" : (r.error || "Failed")
      })));
    }

    setLoading(false);
  };

  return (
    <div className="container mx-auto p-4 md:p-8">
      <h1 className="text-3xl font-bold mb-4 text-gray-800">Bulk DA & Spam Score Checker</h1>
      <p className="text-gray-600 mb-6">Check Domain Authority (DA) and Spam Score for multiple websites at once. Enter one URL per line.</p>

      <div className="mb-6">
        <label htmlFor="url-input" className="block text-sm font-medium text-gray-700 mb-2">
          Enter URLs (one per line):
        </label>
        <textarea
          id="url-input"
          className="w-full p-3 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 text-gray-900 h-48 resize-y"
          placeholder="https://example.com&#10;https://yelp.com"
          value={urlsInput}
          onChange={(e) => setUrlsInput(e.target.value)}
        ></textarea>
      </div>

      <button
        onClick={handleCheckMetrics}
        disabled={loading || urlsInput.trim() === ''}
        className="w-full md:w-auto px-6 py-3 bg-blue-600 text-white font-semibold rounded-md shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {loading ? (
          <span className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Checking...
          </span>
        ) : (
          'Check Metrics'
        )}
      </button>

      <div className="mt-10">
        <h2 className="text-2xl font-semibold mb-4 text-gray-800">Results</h2>
        {loading && results.length === 0 ? (
          <div className="flex items-center justify-center py-8 text-blue-600">
            <p>Loading results...</p>
          </div>
        ) : results.length === 0 ? (
          <p className="text-gray-500">No results yet. Enter URLs and click "Check Metrics".</p>
        ) : (
          <div className="overflow-x-auto bg-white rounded-md shadow-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">URL</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Domain Authority</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spam Score</th>
                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>

                  <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Quality
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
  {results.map((result) => (
    <tr key={result.url}>
      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-blue-600 hover:underline">
        <a
          href={result.url}
          target="_blank"
          rel="noopener noreferrer"
        >
          {result.url}
        </a>
      </td>

      {/* Domain Authority */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
        <span
          className={
            (result.domainAuthority ?? 0) >= 50
              ? "text-green-600 font-semibold"
              : "text-red-600 font-semibold"
          }
        >
          {result.domainAuthority ?? "N/A"}
        </span>
      </td>

      {/* Spam Score */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-center">
        <span
          className={
            (result.spamScore ?? 100) < 5
              ? "text-green-600 font-semibold"
              : "text-red-600 font-semibold"
          }
        >
          {result.spamScore ?? "N/A"}%
        </span>
      </td>

      {/* Status */}
      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
        {result.status}
      </td>

      {/* Quality */}
      <td className="px-6 py-4 whitespace-nowrap text-sm">
        {result.domainAuthority !== null &&
        result.spamScore !== null &&
        result.domainAuthority >= 50 &&
        result.spamScore < 5 ? (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-green-100 text-green-800 font-semibold">
            ✅ Recommended
          </span>
        ) : (
          <span className="inline-flex items-center px-3 py-1 rounded-full bg-red-100 text-red-800 font-semibold">
            ❌ Not Recommended
          </span>
        )}
      </td>
    </tr>
  ))}
</tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}