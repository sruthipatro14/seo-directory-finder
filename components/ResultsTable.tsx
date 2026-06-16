"use client";

import { Website } from "@/types/website";
import { formatDateSafe } from "@/services/dateUtils";

interface ResultsTableProps {
  websites: Website[];
}

// Extending the type locally to include verificationMethod if not in base type
type DirectoryResult = Website & { 
  verificationMethod?: string;
  hasAddBusiness?: boolean;
  hasSubmitListing?: boolean;
  hasClaimListing?: boolean;
  hasCreateProfile?: boolean;
  listingConfidence?: number;
};


const daCategoryStyles: Record<Website["daCategory"], string> = {
  Low: "bg-red-900/20 text-red-400",
  Average: "bg-amber-900/20 text-amber-400",
  Excellent: "bg-emerald-900/20 text-emerald-400",
};

function getDisplayDomain(urlStr: string): string {
  try {
    const url = new URL(urlStr);
    return url.hostname.replace(/^www\./, "");
  } catch {
    return "N/A";
  }
}

export default function ResultsTable({ websites }: ResultsTableProps) {
  if (websites.length === 0) {
    return (
      <p className="text-center text-zinc-500 py-12">No results found.</p>
    );
  }

  return (
    <div className="w-full overflow-x-auto rounded-xl border border-slate-700 shadow-sm">
      <table className="w-full text-sm text-left">
        <thead className="sticky top-0 z-10 bg-slate-900 text-slate-400 uppercase text-xs tracking-wider">
          <tr>
            <th className="px-4 py-3 font-medium">Directory Name</th>
            <th className="px-4 py-3 font-medium">Domain</th>
            <th className="px-4 py-3 font-medium">Add Listing URL</th>
            <th className="px-4 py-3 font-medium">Free/Paid</th>
            <th className="px-4 py-3 font-medium">Listing Capable</th>
            <th className="px-4 py-3 font-medium">Verification Type</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-800 text-slate-50">
          {websites.map((site) => (
            <tr
              key={site.id}
              className="bg-slate-950 even:bg-slate-900 hover:bg-slate-800 transition-colors duration-150"
            >
              {/* Website Name */}
              <td className="px-4 py-3 font-medium text-slate-50">
                {site.url && getDisplayDomain(site.url) !== "N/A" ? (
                  <a
                    href={site.submissionUrl || site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="font-semibold text-blue-400 hover:underline cursor-pointer transition-colors duration-150"
                  >
                    {site.name}
                  </a>
                ) : (
                  <div className="font-semibold">{site.name}</div>
                )}
                <div className="text-xs text-slate-400 truncate max-w-[200px]">{site.description}</div>
              </td>

              <td className="px-4 py-3 text-slate-400 text-xs">
                {site.url && getDisplayDomain(site.url) !== "N/A" ? (
                  <span className="text-slate-400">
                    {getDisplayDomain(site.url)}
                  </span>
                ) : (
                  "N/A"
                )}
              </td>

              <td className="px-4 py-3 text-xs truncate max-w-[200px]">
                {site.submissionUrl ? (
                  <a href={site.submissionUrl} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline font-mono">
                    {site.submissionUrl}
                  </a>
                ) : (
                  <span className="text-slate-500 italic">N/A</span>
                )}
              </td>

              <td className="px-4 py-3">
                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${site.freeOrPaid === 'Free' || site.freeListing ? 'bg-emerald-900/20 text-emerald-400' : 'bg-blue-900/20 text-blue-400'}`}>
                  {site.freeOrPaid || (site.freeListing ? 'Free' : 'Paid')}
                </span>
              </td>

              <td className="px-4 py-3 min-w-[160px]">
                <div className="flex flex-col gap-1 text-[10px] bg-slate-900/40 p-2 rounded-lg border border-slate-800">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Add Business:</span>
                    <span className={(site as DirectoryResult).hasAddBusiness ? "text-emerald-400 font-bold" : "text-slate-600"}>
                      {(site as DirectoryResult).hasAddBusiness ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Submit Listing:</span>
                    <span className={(site as DirectoryResult).hasSubmitListing ? "text-emerald-400 font-bold" : "text-slate-600"}>
                      {(site as DirectoryResult).hasSubmitListing ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Claim Listing:</span>
                    <span className={(site as DirectoryResult).hasClaimListing ? "text-emerald-400 font-bold" : "text-slate-600"}>
                      {(site as DirectoryResult).hasClaimListing ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Create Profile:</span>
                    <span className={(site as DirectoryResult).hasCreateProfile ? "text-emerald-400 font-bold" : "text-slate-600"}>
                      {(site as DirectoryResult).hasCreateProfile ? "Yes" : "No"}
                    </span>
                  </div>
                  <div className="mt-1 pt-1 border-t border-slate-700 flex justify-between font-semibold">
                    <span className="text-slate-400">Confidence:</span>
                    <span className="text-blue-400">{(site as DirectoryResult).listingConfidence ?? 0}%</span>
                  </div>
                </div>
              </td>

              <td className="px-4 py-3 text-slate-400 text-xs italic">
                {(site as DirectoryResult).verificationMethod || "Email / Phone"}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
