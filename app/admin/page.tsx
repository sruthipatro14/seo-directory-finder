import Link from "next/link";
import { getAdminStats } from "@/services/websiteService";
import { getMostSearchedKeywords } from "@/services/searchHistoryService";
import ExportButton from "@/components/ExportButton";

export default async function AdminDashboardPage() {
  const stats = await getAdminStats();
  const topKeywords = await getMostSearchedKeywords(5);

  return (
    <div className="min-h-screen bg-white dark:bg-black text-zinc-900 dark:text-zinc-100">
      {/* Navbar matching existing site design */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight">Admin Dashboard</h1>
        <div className="flex items-center gap-6">
          <ExportButton data={stats.recentWebsites} filename="recent-websites.xlsx" />
          <Link href="/" className="text-sm font-medium hover:opacity-70 transition-opacity">Live Directory</Link>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto p-8 space-y-12">
        {/* Metric Overview */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard label="Total Websites" value={stats.totalWebsites} />
          <StatCard label="Industries" value={stats.totalIndustries} />
          <StatCard label="Avg. Authority" value={stats.averageDA} />
          <StatCard label="Avg. Spam" value={stats.averageSpamScore} />
          <StatCard label="Free Listing" value={stats.freeListingSites} />
        </section>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          {/* Recent Websites */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-zinc-100 dark:border-zinc-900 pb-2">Recently Added</h2>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Directory</th>
                    <th className="px-4 py-3 font-semibold text-right">DA</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {stats.recentWebsites.map((site) => (
                    <tr key={site.id} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                      <td className="px-4 py-4">
                        <div className="font-medium">{site.name}</div>
                        <div className="text-xs text-zinc-500 truncate max-w-[200px]">{site.url}</div>
                      </td>
                      <td className="px-4 py-4 text-right">
                        <span className="px-2 py-1 rounded bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 font-mono text-xs">
                          {site.domainAuthority}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Popular Searches */}
          <section className="space-y-4">
            <h2 className="text-xl font-bold border-b border-zinc-100 dark:border-zinc-900 pb-2">Most Searched</h2>
            <div className="rounded-xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <table className="w-full text-left text-sm">
                <thead className="bg-zinc-50 dark:bg-zinc-950/50 border-b border-zinc-200 dark:border-zinc-800">
                  <tr>
                    <th className="px-4 py-3 font-semibold">Keyword</th>
                    <th className="px-4 py-3 font-semibold text-right">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-200 dark:divide-zinc-800">
                  {topKeywords.map((item) => (
                    <tr key={item.keyword} className="hover:bg-zinc-50/50 dark:hover:bg-zinc-950/20 transition-colors">
                      <td className="px-4 py-4 capitalize font-medium">{item.keyword}</td>
                      <td className="px-4 py-4 text-right font-bold text-zinc-400 font-mono">{item.count}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>

        {/* Category Distribution */}
        <section className="space-y-4">
          <h2 className="text-xl font-bold border-b border-zinc-100 dark:border-zinc-900 pb-2">DA Category Distribution</h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {stats.daDistribution.map((dist) => (
              <div key={dist.category} className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 flex flex-col items-center shadow-sm">
                <span className="text-xs uppercase tracking-widest text-zinc-500 mb-2 font-semibold">{dist.category}</span>
                <span className="text-3xl font-bold">{dist.count}</span>
              </div>
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}

function StatCard({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm">
      <div className="text-xs text-zinc-500 mb-2 font-medium uppercase tracking-tight">{label}</div>
      <div className="text-3xl font-bold tabular-nums tracking-tighter">{value}</div>
    </div>
  );
}