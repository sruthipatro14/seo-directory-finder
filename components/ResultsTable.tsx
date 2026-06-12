import { Website } from "@/types/website";

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
            <th className="px-4 py-3 font-medium">Domain Authority</th>
            <th className="px-4 py-3 font-medium">DA Category</th>
            <th className="px-4 py-3 font-medium">Spam Score</th>
            <th className="px-4 py-3 font-medium">Free Listing</th>
            <th className="px-4 py-3 font-medium">Industry</th>
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
                <a
                  href={site.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:underline text-blue-600 dark:text-blue-400"
                >
                  {site.name}
                </a>
              </td>

              {/* Domain Authority */}
              <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                {site.domainAuthority}
              </td>

              {/* DA Category */}
              <td className="px-4 py-3">
                <span
                  className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${daCategoryStyles[site.daCategory]}`}
                >
                  {site.daCategory}
                </span>
              </td>

              {/* Spam Score */}
              <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                {site.spamScore}%
              </td>

              {/* Free Listing */}
              <td className="px-4 py-3">
                {site.freeListing ? (
                  <span className="text-green-600 font-semibold">✓ Free</span>
                ) : (
                  <span className="text-zinc-400">Paid</span>
                )}
              </td>

              {/* Industry */}
              <td className="px-4 py-3 text-zinc-700 dark:text-zinc-300">
                {site.industry}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
