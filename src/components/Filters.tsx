import { useEffect, useRef, useState } from 'react';
import { Icon } from './Icon.tsx';

const SORT_OPTIONS = [
  { label: 'Newest first', value: 'newest' },
  { label: 'Oldest first', value: 'oldest' },
  { label: 'Most stars', value: 'stars' },
  { label: 'Most additions', value: 'additions' },
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

function Chip({
  active,
  label,
  onClick,
}: {
  active: boolean;
  label: string;
  onClick: () => void;
}) {
  return (
    <button className={active ? 'chip active' : 'chip'} type="button" onClick={onClick}>
      {label}
    </button>
  );
}

function SortDropdown({
  value,
  onChange,
}: {
  value: SortOption;
  onChange: (v: SortOption) => void;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const current = SORT_OPTIONS.find((o) => o.value === value)!;

  useEffect(() => {
    function handler(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  return (
    <div className="sort-dropdown" ref={ref}>
      <button
        type="button"
        className="sort-trigger"
        aria-haspopup="listbox"
        aria-expanded={open}
        onClick={() => setOpen((o) => !o)}
      >
        <Icon name="sort" />
        <span>{current.label}</span>
        <Icon name="chevron-down" />
      </button>

      {open && (
        <ul className="sort-menu" role="listbox" aria-label="Sort contributions">
          {SORT_OPTIONS.map((option) => (
            <li
              key={option.value}
              role="option"
              aria-selected={option.value === value}
              className={option.value === value ? 'sort-option selected' : 'sort-option'}
              onClick={() => {
                onChange(option.value);
                setOpen(false);
              }}
            >
              {option.value === value && <Icon name="check" />}
              {option.label}
            </li>
          ))}
        </ul>
      )}
    </div>
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
  const hasActiveFilters = !!search || !!selectedLanguage || !!selectedImpact || sortBy !== 'newest';

  return (
    <div className="filter-bar" aria-label="Contribution filters">
      {/* Row 1 — search + sort */}
      <div className="filter-row-top">
        <div className="search-field">
          <Icon name="search" />
          <input
            value={search}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search projects, PRs, notes…"
            aria-label="Search contributions"
          />
          {search && (
            <button
              type="button"
              className="search-clear"
              aria-label="Clear search"
              onClick={() => onSearchChange('')}
            >
              <Icon name="x" />
            </button>
          )}
        </div>

        <SortDropdown value={sortBy} onChange={onSortChange} />

        {hasActiveFilters && (
          <button type="button" className="reset-btn" onClick={onReset}>
            Clear all
          </button>
        )}
      </div>

      {/* Row 2 — chip filters (only when options exist) */}
      {(languages.length > 0 || impactOptions.length > 0) && (
        <div className="filter-row-chips">
          {languages.length > 0 && (
            <div className="chip-group">
              <span className="chip-group-label">Language</span>
              <Chip active={!selectedLanguage} label="All" onClick={() => onLanguageChange(null)} />
              {languages.map((lang) => (
                <Chip
                  key={lang}
                  active={selectedLanguage === lang}
                  label={lang}
                  onClick={() => onLanguageChange(lang)}
                />
              ))}
            </div>
          )}

          {impactOptions.length > 0 && (
            <div className="chip-group">
              <span className="chip-group-label">Impact</span>
              <Chip active={!selectedImpact} label="All" onClick={() => onImpactChange(null)} />
              {impactOptions.map((impact) => (
                <Chip
                  key={impact}
                  active={selectedImpact === impact}
                  label={impact}
                  onClick={() => onImpactChange(impact)}
                />
              ))}
            </div>
          )}

          <span className="filter-count">
            {visibleCount === totalCount
              ? `${totalCount} contributions`
              : `${visibleCount} of ${totalCount}`}
          </span>
        </div>
      )}
    </div>
  );
}
