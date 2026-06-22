import { Icon } from './Icon.tsx';

const SORT_OPTIONS = [
  { label: 'Newest', value: 'newest' },
  { label: 'Oldest', value: 'oldest' },
  { label: 'Stars', value: 'stars' },
  { label: 'Additions', value: 'additions' },
] as const;

export type SortOption = 'newest' | 'oldest' | 'stars' | 'additions';

interface FiltersProps {
  search: string;
  onSearchChange: (value: string) => void;
  sortBy: SortOption;
  onSortChange: (value: SortOption) => void;
  languages: string[];
  selectedLanguage: string | null;
  onLanguageChange: (value: string | null) => void;
  impactOptions: string[];
  selectedImpact: string | null;
  onImpactChange: (value: string | null) => void;
  visibleCount: number;
  totalCount: number;
  onReset: () => void;
}

function Chip({ active, label, onClick }: { active: boolean; label: string; onClick: () => void }) {
  return (
    <button className={active ? 'chip active' : 'chip'} type="button" onClick={onClick}>
      {label}
    </button>
  );
}

export function Filters({
  search,
  onSearchChange,
  sortBy,
  onSortChange,
  languages,
  selectedLanguage,
  onLanguageChange,
  impactOptions,
  selectedImpact,
  onImpactChange,
  visibleCount,
  totalCount,
  onReset,
}: FiltersProps) {
  return (
    <aside className="control-panel" aria-label="Contribution filters">
      <div className="search-field">
        <Icon name="search" />
        <input value={search} onChange={(event) => onSearchChange(event.target.value)} placeholder="Search projects, PRs, notes..." aria-label="Search contributions" />
      </div>

      <label className="field-label" htmlFor="sort-contributions">
        Sort
      </label>
      <select id="sort-contributions" value={sortBy} onChange={(event) => onSortChange(event.target.value as SortOption)}>
        {SORT_OPTIONS.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>

      {languages.length > 0 && (
        <div className="filter-group">
          <span className="field-label">Language</span>
          <Chip active={!selectedLanguage} label="All" onClick={() => onLanguageChange(null)} />
          {languages.map((language) => (
            <Chip active={selectedLanguage === language} key={language} label={language} onClick={() => onLanguageChange(language)} />
          ))}
        </div>
      )}

      {impactOptions.length > 0 && (
        <div className="filter-group">
          <span className="field-label">Impact</span>
          <Chip active={!selectedImpact} label="All" onClick={() => onImpactChange(null)} />
          {impactOptions.map((impact) => (
            <Chip active={selectedImpact === impact} key={impact} label={impact} onClick={() => onImpactChange(impact)} />
          ))}
        </div>
      )}

      <div className="filter-footer">
        <span>
          Showing {visibleCount} of {totalCount}
        </span>
        <button type="button" onClick={onReset}>
          Reset
        </button>
      </div>
    </aside>
  );
}
