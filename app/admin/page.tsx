import type { Metadata } from "next";
import { Website } from "@/types/website";

export const metadata: Metadata = {
  title: "Admin Dashboard — SEO Directory Finder",
  description: "Internal admin overview of the website directory.",
};

// ─── Mock data ────────────────────────────────────────────────────────────────
// TODO: replace with real DB call once connected:
//   import { getAllWebsites } from "@/services/websiteService";
//   const websites = await getAllWebsites();

const mockWebsites: Website[] = [
  { id: "1",  name: "Justdial",        url: "https://justdial.com",        domainAuthority: 88, spamScore: 2, freeListing: true,  industry: "General Business", daCategory: "Excellent", active: true  },
  { id: "2",  name: "Sulekha",         url: "https://sulekha.com",         domainAuthority: 75, spamScore: 1, freeListing: true,  industry: "Services",         daCategory: "Excellent", active: true  },
  { id: "3",  name: "IndiaMart",       url: "https://indiamart.com",       domainAuthority: 70, spamScore: 3, freeListing: true,  industry: "Technology",       daCategory: "Excellent", active: true  },
  { id: "4",  name: "HealthGrades",    url: "https://healthgrades.com",    domainAuthority: 68, spamScore: 4, freeListing: false, industry: "Healthcare",       daCategory: "Excellent", active: true  },
  { id: "5",  name: "Zillow",          url: "https://zillow.com",          domainAuthority: 91, spamScore: 1, freeListing: false, industry: "Real Estate",      daCategory: "Excellent", active: true  },
  { id: "6",  name: "Bankrate",        url: "https://bankrate.com",        domainAuthority: 82, spamScore: 2, freeListing: false, industry: "Finance",          daCategory: "Excellent", active: true  },
  { id: "7",  name: "Coursera",        url: "https://coursera.org",        domainAuthority: 89, spamScore: 1, freeListing: false, industry: "Education",        daCategory: "Excellent", active: true  },
  { id: "8",  name: "HubSpot",         url: "https://hubspot.com",         domainAuthority: 93, spamScore: 1, freeListing: true,  industry: "Marketing",        daCategory: "Excellent", active: true  },
  { id: "9",  name: "LegalZoom",       url: "https://legalzoom.com",       domainAuthority: 72, spamScore: 6, freeListing: false, industry: "Legal",            daCategory: "Excellent", active: true  },
  { id: "10", name: "LocalBusiness",   url: "https://localbusiness.com",   domainAuthority: 35, spamScore: 8, freeListing: true,  industry: "General Business", daCategory: "Average",   active: true  },
  { id: "11", name: "SmallBizConnect", url: "https://smallbizconnect.com", domainAuthority: 18, spamScore: 3, freeListing: true,  industry: "General Business", daCategory: "Low",       active: false },
];

// ─── Stat card ────────────────────────────────────────────────────────────────

interface StatCardProps {
  label: string;
  value: string | number;
  sublabel: string;
  icon: React.ReactNode;
  accent: string;
}

function StatCard({ label, value, sublabel, icon, accent }: StatCardProps) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
          {label}
        </span>
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${accent}`}>
          {icon}
        </div>
      </div>
      <div>
        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-none">
          {value}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">{sublabel}</p>
      </div>
    </div>
  );
}

// ─── Recent websites table ────────────────────────────────────────────────────

const daCategoryStyles: Record<Website["daCategory"], string> = {
  Low:       "bg-red-100 text-red-700 dark:bg-red-950 dark:text-red-400",
  Average:   "bg-yellow-100 text-yellow-700 dark:bg-yellow-950 dark:text-yellow-400",
  Excellent: "bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-400",
};

function RecentWebsitesTable({ websites }: { websites: Website[] }) {
  return (
    <div className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 shadow-sm overflow-hidden">
      <div className="px-6 py-4 border-b border-zinc-100 dark:border-zinc-800">
        <h2 className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
          Recent Websites
        </h2>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
          Latest entries in the directory
        </p>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="bg-zinc-50 dark:bg-zinc-900 text-zinc-500 dark:text-zinc-400 text-xs uppercase tracking-wider">
            <tr>
              <th className="px-6 py-3 font-medium">Name</th>
              <th className="px-6 py-3 font-medium">Industry</th>
              <th className="px-6 py-3 font-medium">DA</th>
              <th className="px-6 py-3 font-medium">Category</th>
              <th className="px-6 py-3 font-medium">Spam</th>
              <th className="px-6 py-3 font-medium">Free</th>
              <th className="px-6 py-3 font-medium">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800">
            {websites.slice(0, 8).map((site) => (
              <tr
                key={site.id}
                className="hover:bg-zinc-50 dark:hover:bg-zinc-900 transition-colors"
              >
                <td className="px-6 py-3 font-medium text-zinc-900 dark:text-zinc-100">
                  <a
                    href={site.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:underline text-blue-600 dark:text-blue-400"
                  >
                    {site.name}
                  </a>
                </td>
                <td className="px-6 py-3 text-zinc-500 dark:text-zinc-400">
                  {site.industry}
                </td>
                <td className="px-6 py-3 text-zinc-700 dark:text-zinc-300 font-medium">
                  {site.domainAuthority}
                </td>
                <td className="px-6 py-3">
                  <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${daCategoryStyles[site.daCategory]}`}>
                    {site.daCategory}
                  </span>
                </td>
                <td className="px-6 py-3 text-zinc-500 dark:text-zinc-400">
                  {site.spamScore}%
                </td>
                <td className="px-6 py-3">
                  {site.freeListing ? (
                    <span className="text-green-600 dark:text-green-400 font-semibold">✓ Free</span>
                  ) : (
                    <span className="text-zinc-400">Paid</span>
                  )}
                </td>
                <td className="px-6 py-3">
                  {site.active ? (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 dark:text-green-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-green-500 inline-block" />
                      Active
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-400">
                      <span className="w-1.5 h-1.5 rounded-full bg-zinc-400 inline-block" />
                      Inactive
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AdminPage() {
  const websites = mockWebsites;

  const total         = websites.length;
  const activeCount   = websites.filter((s) => s.active).length;
  const freeCount     = websites.filter((s) => s.freeListing).length;
  const lowSpamCount  = websites.filter((s) => s.spamScore < 5).length;
  const avgDA         = total === 0 ? 0 : Math.round(websites.reduce((sum, s) => sum + s.domainAuthority, 0) / total);
  const industryCount = new Set(websites.map((s) => s.industry)).size;

  const stats: StatCardProps[] = [
    {
      label:    "Total Websites",
      value:    total,
      sublabel: `${activeCount} active`,
      accent:   "bg-blue-50 dark:bg-blue-950 text-blue-500",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
      ),
    },
    {
      label:    "Total Industries",
      value:    industryCount,
      sublabel: "unique categories",
      accent:   "bg-indigo-50 dark:bg-indigo-950 text-indigo-500",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
        </svg>
      ),
    },
    {
      label:    "Avg Domain Authority",
      value:    avgDA,
      sublabel: "mean DA across all sites",
      accent:   "bg-purple-50 dark:bg-purple-950 text-purple-500",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label:    "Free Listing Sites",
      value:    freeCount,
      sublabel: `${total > 0 ? Math.round((freeCount / total) * 100) : 0}% of total`,
      accent:   "bg-green-50 dark:bg-green-950 text-green-500",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      label:    "Low Spam Sites",
      value:    lowSpamCount,
      sublabel: "spam score below 5%",
      accent:   "bg-amber-50 dark:bg-amber-950 text-amber-500",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-900">
      {/* Top bar */}
      <header className="bg-white dark:bg-zinc-950 border-b border-zinc-200 dark:border-zinc-800">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
              Admin Dashboard
            </h1>
            <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-0.5">
              SEO Directory Finder — internal overview
            </p>
          </div>
          <a
            href="/"
            className="text-xs font-medium text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
          >
            ← Back to site
          </a>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        {/* Stats — 5 cards */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
            Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4">
            {stats.map((stat) => (
              <StatCard key={stat.label} {...stat} />
            ))}
          </div>
        </div>

        {/* DA breakdown */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
            Domain Authority Breakdown
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["Low", "Average", "Excellent"] as Website["daCategory"][]).map((cat) => {
              const count    = websites.filter((s) => s.daCategory === cat).length;
              const pct      = total > 0 ? Math.round((count / total) * 100) : 0;
              const barColor = cat === "Low" ? "bg-red-500" : cat === "Average" ? "bg-yellow-500" : "bg-green-500";
              const textColor = cat === "Low"
                ? "text-red-600 dark:text-red-400"
                : cat === "Average"
                  ? "text-yellow-600 dark:text-yellow-400"
                  : "text-green-600 dark:text-green-400";
              return (
                <div
                  key={cat}
                  className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 p-5 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
                      {cat} DA
                    </span>
                    <span className={`text-sm font-bold ${textColor}`}>{pct}%</span>
                  </div>
                  <p className="text-2xl font-bold text-zinc-900 dark:text-zinc-100 mb-3">
                    {count}
                  </p>
                  <div className="w-full h-1.5 rounded-full bg-zinc-100 dark:bg-zinc-800">
                    <div
                      className={`h-1.5 rounded-full ${barColor}`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent websites table */}
        <div>
          <h2 className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest mb-4">
            Directory
          </h2>
          <RecentWebsitesTable websites={websites} />
        </div>
      </main>
    </div>
  );
}
