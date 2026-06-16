'use client'

import { useState } from "react";
import { FilterState } from "@/components/DirectorySection";

const defaultFilters: FilterState = {
  daLow: false,
  daAverage: false,
  daExcellent: false,
  freeListingOnly: false,
  spamBelow5: false,
  industry: "All Industries",
};

const INDUSTRIES = [
  "All Industries",
  "General Business",
  "Technology",
  "Healthcare",
  "Real Estate",
  "Finance",
  "Education",
  "Marketing",
  "Legal",
];

interface CheckboxRowProps {
  id: string;
  label: string;
  sublabel?: string;
  checked: boolean;
  onChange: () => void;
}

function CheckboxRow({ id, label, sublabel, checked, onChange }: CheckboxRowProps) {
  return (
    <label htmlFor={id} className="flex items-start gap-3 cursor-pointer group">
      <div className="relative mt-0.5">
        <input
          id={id}
          type="checkbox"
          checked={checked}
          onChange={onChange}
          className="sr-only peer"
        />
        <div className="w-4 h-4 rounded border border-slate-600 bg-slate-800 peer-checked:bg-blue-600 peer-checked:border-blue-600 transition-colors" />
        <svg
          className="absolute inset-0 w-4 h-4 text-white opacity-0 peer-checked:opacity-100 transition-opacity pointer-events-none"
          viewBox="0 0 16 16"
          fill="none"
        >
          <path
            d="M3.5 8l3 3 6-6"
            stroke="currentColor"
            strokeWidth="1.75"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
      <div className="flex flex-col">
        <span className="text-sm text-slate-300 group-hover:text-slate-50 transition-colors leading-tight">
          {label}
        </span>
        {sublabel && (
          <span className="text-xs text-slate-500 mt-0.5">{sublabel}</span>
        )}
      </div>
    </label>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-semibold text-slate-500 uppercase tracking-widest mb-3">
      {children}
    </p>
  );
}

interface FilterSidebarProps {
  onFilterChange: (filters: FilterState) => void;
}

export default function FilterSidebar({ onFilterChange }: FilterSidebarProps) {
  const [filters, setFilters] = useState<FilterState>(defaultFilters);

  function toggle(key: keyof Omit<FilterState, "industry">) {
    const next = { ...filters, [key]: !filters[key] };
    setFilters(next);
    onFilterChange(next);
  }

  function setIndustry(industry: string) {
    const next = { ...filters, industry };
    setFilters(next);
    onFilterChange(next);
  }

  function reset() {
    setFilters(defaultFilters);
    onFilterChange(defaultFilters);
  }

  const activeCount = [
    filters.daLow,
    filters.daAverage,
    filters.daExcellent,
    filters.freeListingOnly,
    filters.spamBelow5,
    filters.industry !== "All Industries",
  ].filter(Boolean).length;

  return (
    <aside className="w-full rounded-xl border border-slate-700 bg-slate-800 overflow-hidden shadow-lg">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-700">
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
              d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2a1 1 0 01-.293.707L13 13.414V19a1 1 0 01-.553.894l-4 2A1 1 0 017 21v-7.586L3.293 6.707A1 1 0 013 6V4z"
            />
          </svg>
          <span className="text-sm font-semibold text-slate-50">Filters</span>
          {activeCount > 0 && (
            <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-blue-600 text-white text-xs font-bold">
              {activeCount}
            </span>
          )}
        </div>
        {activeCount > 0 && (
          <button
            onClick={reset}
            className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
          > {/* Added duration-150 for subtle animation */}
            Reset all
          </button>
        )}
      </div>

      <div className="px-5 py-5 space-y-6">
        {/* Domain Authority */}
        <div>
          <SectionLabel>Domain Authority</SectionLabel>
          <div className="space-y-2.5">
            <CheckboxRow
              id="da-low"
              label="Low Authority"
              sublabel="DA 1–20"
              checked={filters.daLow}
              onChange={() => toggle("daLow")}
            />
            <CheckboxRow
              id="da-average"
              label="Average Authority"
              sublabel="DA 21–50"
              checked={filters.daAverage}
              onChange={() => toggle("daAverage")}
            />
            <CheckboxRow
              id="da-excellent"
              label="Excellent Authority"
              sublabel="DA 51–100"
              checked={filters.daExcellent}
              onChange={() => toggle("daExcellent")}
            />
          </div>
        </div>

        <hr className="border-slate-700" />

        {/* Free Listings */}
        <div>
          <SectionLabel>Listing Type</SectionLabel>
          <CheckboxRow
            id="free-listing"
            label="Free Listings Only"
            checked={filters.freeListingOnly}
            onChange={() => toggle("freeListingOnly")}
          />
        </div>

        <hr className="border-slate-700" />

        {/* Spam Score */}
        <div>
          <SectionLabel>Spam Score</SectionLabel>
          <CheckboxRow
            id="spam-below5"
            label="Below 5%"
            sublabel="Low spam risk only"
            checked={filters.spamBelow5}
            onChange={() => toggle("spamBelow5")}
          />
        </div>

        <hr className="border-slate-700" />

        {/* Industry */}
        <div>
          <SectionLabel>Industry</SectionLabel>
          <div className="relative">
            <select
              value={filters.industry}
              onChange={(e) => setIndustry(e.target.value)}
              className="w-full appearance-none rounded-xl border border-slate-700 bg-slate-900 px-3 py-2.5 pr-8 text-sm text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent cursor-pointer transition-colors duration-150"
            >
              {INDUSTRIES.map((ind) => (
                <option key={ind} value={ind}>{ind}</option>
              ))}
            </select>
            <div className="pointer-events-none absolute inset-y-0 right-3 flex items-center">
              <svg
                className="h-3.5 w-3.5 text-slate-500"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth={2}
              >
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
              </svg>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}
