import { Website } from "@/types/website";

interface DashboardStatsProps {
  websites: Website[];
}

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
      {/* Top row — label + icon */}
      <div className="flex items-center justify-between">
        <span className="text-xs font-semibold text-zinc-400 dark:text-zinc-500 uppercase tracking-widest">
          {label}
        </span>
        <div className={`flex items-center justify-center w-8 h-8 rounded-lg ${accent}`}>
          {icon}
        </div>
      </div>

      {/* Value */}
      <div>
        <p className="text-3xl font-bold text-zinc-900 dark:text-zinc-100 leading-none">
          {value}
        </p>
        <p className="text-xs text-zinc-400 dark:text-zinc-500 mt-1.5">{sublabel}</p>
      </div>
    </div>
  );
}

export default function DashboardStats({ websites }: DashboardStatsProps) {
  const total = websites.length;

  const freeCount = websites.filter((s) => s.freeListing).length;

  const avgDA =
    total === 0
      ? 0
      : Math.round(
          websites.reduce((sum, s) => sum + s.domainAuthority, 0) / total
        );

  const lowSpamCount = websites.filter((s) => s.spamScore < 5).length;

  const stats: StatCardProps[] = [
    {
      label: "Total Websites",
      value: total,
      sublabel: "websites in directory",
      accent: "bg-blue-50 dark:bg-blue-950 text-blue-500",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
        </svg>
      ),
    },
    {
      label: "Free Listing Sites",
      value: freeCount,
      sublabel: `${total > 0 ? Math.round((freeCount / total) * 100) : 0}% of total`,
      accent: "bg-green-50 dark:bg-green-950 text-green-500",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
        </svg>
      ),
    },
    {
      label: "Avg Domain Authority",
      value: avgDA,
      sublabel: "mean DA across all sites",
      accent: "bg-purple-50 dark:bg-purple-950 text-purple-500",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
        </svg>
      ),
    },
    {
      label: "Low Spam Sites",
      value: lowSpamCount,
      sublabel: "spam score below 5%",
      accent: "bg-amber-50 dark:bg-amber-950 text-amber-500",
      icon: (
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
        </svg>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat) => (
        <StatCard key={stat.label} {...stat} />
      ))}
    </div>
  );
}
