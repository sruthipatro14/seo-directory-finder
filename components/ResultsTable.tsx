"use client";

import { Website } from "@/types/website";
import { formatDateSafe } from "@/services/dateUtils";

interface ResultsTableProps {
  websites: Website[];
}

const daCategoryStyles: Record<Website["daCategory"], string> = {
  Low: "bg-red-100 text-red-700",
  Average: "bg-yellow-100 text-yellow-700",
  Excellent: "bg-green-100 text-green-700",
};

export default function ResultsTable({ websites }: ResultsTableProps) {
  if (websites.length === 0) {
    return (
      <p className="text-center text-zinc-500 py-12">No results found.</p>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-lg border border-zinc-200 dark:border-zinc-800">
      <table className="w-full text-sm text-left">
        <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3 font-medium">Website Name</th>
            <th className="px-4 py-3 font-medium">Domain</th>
            <th className="px-4 py-3 font-medium text-center">DA</th>
            <th className="px-4 py-3 font-medium text-center">Spam</th>
            <th className="px-4 py-3 font-medium">Traffic</th>
            <th className="px-4 py-3 font-medium">Contact</th>
            <th className="px-4 py-3 font-medium">Status</th>
            <th className="px-4 py-3 font-medium">Date Added</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
          {websites.map((site) => (
            <tr
              key={site.id}
              className="bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
            >
              {/* Website Name */}
              <td className="px-4 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                <div className="font-semibold">{site.name}</div>
                <div className="text-xs text-zinc-500 truncate max-w-[200px]">{site.description}</div>
              </td>

              <td className="px-4 py-3 text-zinc-500 text-xs">
                {new URL(site.url).hostname}
              </td>

              <td className="px-4 py-3 text-center text-zinc-700 dark:text-zinc-300 font-mono">
                {site.domainAuthority}
              </td>

              <td className="px-4 py-3 text-center text-zinc-700 dark:text-zinc-300 font-mono">
                {site.spamScore}%
              </td>

              <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300 text-xs font-mono text-right">
                {site.estimatedTraffic?.toLocaleString() || '0'}
              </td>

              <td className="px-4 py-3 text-zinc-500 text-xs">
                {site.contactEmail || <span className="text-zinc-400 italic">Not found</span>}
              </td>

              <td className="px-4 py-3">
                <span className={`text-[10px] px-2 py-1 rounded-full uppercase font-bold ${site.active ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                  {site.active ? 'Active' : 'Offline'}
                </span>
              </td>

              <td className="px-4 py-3 text-zinc-500 text-[10px]">
                {formatDateSafe(site.createdAt)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
