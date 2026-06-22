import type { EnrichedContribution } from '../types.ts';

export type SortKey = 'newest' | 'oldest' | 'stars' | 'additions';

interface FiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: SortKey;
  onSortChange: (value: SortKey) => void;
  allLanguages: string[];
  selectedLanguage: string | null;
  onLanguageChange: (value: string | null) => void;
  selectedImpact: string | null;
  onImpactChange: (value: string | null) => void;
  contributions: EnrichedContribution[];
}

function FilterPill({
  label,
  active,
  onClick,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      className={`text-xs px-2.5 py-1 rounded-full font-semibold border cursor-pointer capitalize transition-all ${
        active
          ? 'bg-indigo-600 border-indigo-600 text-white dark:bg-indigo-500 dark:border-indigo-500'
          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
      }`}
    >
      {label}
    </button>
  );
}

export function Filters({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  allLanguages,
  selectedLanguage,
  onLanguageChange,
  selectedImpact,
  onImpactChange,
  contributions,
}: FiltersProps) {
  const hasImpactData = contributions.some((c) => c.impact);

  return (
    <aside className="lg:col-span-1 space-y-6">
      <div className="rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
        <h2 className="font-bold text-lg text-slate-900 dark:text-slate-100">Filters &amp; Search</h2>

        {/* Search Input */}
        <div className="space-y-2">
          <label
            htmlFor="search-input"
            className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block"
          >
            Search
          </label>
          <input
            id="search-input"
            type="text"
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search PR title, project..."
            className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
          />
        </div>

        {/* Sort Dropdown */}
        <div className="space-y-2">
          <label
            htmlFor="sort-select"
            className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block"
          >
            Sort By
          </label>
          <select
            id="sort-select"
            value={sortBy}
            onChange={(e) => onSortChange(e.target.value as SortKey)}
            className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="newest">Latest Merged</option>
            <option value="oldest">Oldest Merged</option>
            <option value="stars">Stars Count</option>
            <option value="additions">Code Size Addition</option>
          </select>
        </div>

        {/* Impact Filter */}
        {hasImpactData && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Impact Rating
            </span>
            <div className="flex flex-wrap gap-2">
              {(['all', 'high', 'medium', 'low'] as const).map((impact) => (
                <FilterPill
                  key={impact}
                  label={impact}
                  active={impact === 'all' ? !selectedImpact : selectedImpact === impact}
                  onClick={() => onImpactChange(impact === 'all' ? null : impact)}
                />
              ))}
            </div>
          </div>
        )}

        {/* Language Filter */}
        {allLanguages.length > 0 && (
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
              Language Focus
            </span>
            <div className="flex flex-wrap gap-1.5">
              <FilterPill
                label="All Languages"
                active={!selectedLanguage}
                onClick={() => onLanguageChange(null)}
              />
              {allLanguages.map((lang) => (
                <FilterPill
                  key={lang}
                  label={lang}
                  active={selectedLanguage === lang}
                  onClick={() => onLanguageChange(lang)}
                />
              ))}
            </div>
          </div>
        )}
      </div>
    </aside>
  );
}
