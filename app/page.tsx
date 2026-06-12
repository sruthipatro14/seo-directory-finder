import HomepageClient from "@/components/HomepageClient";
import { Website } from "@/types/website";

const initialWebsites: Website[] = [
  {
    id: "1",
    name: "Justdial",
    url: "https://justdial.com",
    domainAuthority: 88,
    spamScore: 2,
    freeListing: true,
    industry: "General Business",
    daCategory: "Excellent",
    active: true,
  },
  {
    id: "2",
    name: "Sulekha",
    url: "https://sulekha.com",
    domainAuthority: 75,
    spamScore: 1,
    freeListing: true,
    industry: "Services",
    daCategory: "Excellent",
    active: true,
  },
];

export default function Home() {
  return (
    <main className="min-h-screen bg-white dark:bg-black">
      {/* Navbar */}
      <nav className="flex items-center justify-between px-8 py-6 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold">SEO Directory Finder</h1>

        <div className="flex gap-6">
          <a href="#">Features</a>
          <a href="#">Directory</a>
          <a href="#">Pricing</a>
        </div>

        <div className="flex gap-3">
          <button className="px-4 py-2 border rounded-lg">Login</button>
          <button className="px-4 py-2 bg-black text-white rounded-lg dark:bg-white dark:text-black">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero + Directory — client-managed */}
      <HomepageClient initialWebsites={initialWebsites} />
    </main>
  );
}
