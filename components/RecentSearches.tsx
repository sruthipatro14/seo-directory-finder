import Link from "next/link";
import { formatDateSafe } from "@/services/dateUtils";
import DeleteSearchButton from "@/components/DeleteSearchButton";

// SearchHistory shape — mirrors Prisma's generated type.
// Defined locally so callers can pass plain objects without importing from @prisma/client.
export interface SearchHistoryItem {
  id: string;
  keyword: string;
  createdAt: Date;
}

interface RecentSearchesProps {
  searches: SearchHistoryItem[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function keywordToSlug(keyword: string): string {
  return keyword.trim().toLowerCase().replace(/\s+/g, "-");
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function RecentSearches({ searches }: RecentSearchesProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
      {/* Card header */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <div className="flex items-center gap-2">
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
              d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
            Recent Searches
          </h2>
          {searches.length > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 text-xs font-semibold">
              {searches.length}
            </span>
          )}
        </div>
        <span className="text-xs text-zinc-400 dark:text-zinc-500">
          Last{" "}
          {searches.length === 1 ? "search" : `${searches.length} searches`}
        </span>
      </div>

      {/* Empty state */}
      {searches.length === 0 && (
        <div className="px-6 py-12 text-center">
          <svg
            className="w-8 h-8 text-zinc-300 dark:text-zinc-700 mx-auto mb-3"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={1.5}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M21 21l-4.35-4.35M17 11A6 6 0 1 1 5 11a6 6 0 0 1 12 0z"
            />
          </svg>
          <p className="text-sm text-zinc-400 dark:text-zinc-500">
            No searches yet.
          </p>
        </div>
      )}

      {/* Table */}
      {searches.length > 0 && (
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-400 dark:text-zinc-500 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-3 text-left font-medium">Keyword</th>
                <th className="px-6 py-3 text-left font-medium">Date</th>
                <th className="px-6 py-3 text-right font-medium">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
              {searches.map((item) => (
                <tr
                  key={item.id}
                  className="group hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
                >
                  {/* Keyword — navigates to /directories?keyword=slug */}
                  <td className="px-6 py-3">
                    <Link
                      href={`/directories?keyword=${keywordToSlug(item.keyword)}`}
                      className="inline-flex items-center gap-2 font-medium text-zinc-800 dark:text-zinc-200 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group/link"
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-blue-500 shrink-0 opacity-0 group-hover/link:opacity-100 transition-opacity" />
                      {item.keyword}
                    </Link>
                  </td>

                  {/* Date */}
                  <td className="px-6 py-3 text-zinc-400 dark:text-zinc-500 whitespace-nowrap">
                    {formatDateSafe(item.createdAt, true)}
                  </td>

                  {/* Delete */}
                  <td className="px-6 py-3 text-right">
                    <DeleteSearchButton id={item.id} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
