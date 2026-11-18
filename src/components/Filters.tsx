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
  projects: string[];
  selectedProject: string;
  onProjectChange: (value: string) => void;
  visibleCount: number;
  totalCount: number;
  onReset: () => void;
}

function Dropdown<T extends string>({ value, onChange, options, label, icon }: {
  value: T;
  onChange: (value: T) => void;
  options: ReadonlyArray<{ label: string; value: T }>;
  label: string;
  icon: 'sort' | 'book';
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const current = options.find(option => option.value === value) ?? options[0];

  useEffect(() => {
    function closeOutside(event: MouseEvent) {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', closeOutside);
    return () => document.removeEventListener('mousedown', closeOutside);
  }, []);

  return (
    <div className="sort-dropdown" ref={ref} onBlur={event => {
      if (!event.currentTarget.contains(event.relatedTarget)) setOpen(false);
    }} onKeyDown={event => {
      if (event.key === 'Escape') {
        event.preventDefault();
        setOpen(false);
        triggerRef.current?.focus();
      }
    }}>
      <button ref={triggerRef} type="button" className="sort-trigger"
        aria-label={label + ': ' + current?.label} aria-haspopup="listbox" aria-expanded={open}
        onClick={() => setOpen(previous => !previous)}
        onKeyDown={event => {
          if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
            event.preventDefault();
            setOpen(true);
          }
        }}>
        <Icon name={icon} /><span>{current?.label}</span><Icon name="chevron-down" />
      </button>
      {open && (
        <ul className="sort-menu" role="listbox" aria-label={label} onKeyDown={event => {
          const buttons = Array.from(event.currentTarget.querySelectorAll<HTMLButtonElement>('[role="option"]'));
          const index = buttons.indexOf(document.activeElement as HTMLButtonElement);
          let next = index;
          if (event.key === 'ArrowDown') next = (index + 1) % buttons.length;
          else if (event.key === 'ArrowUp') next = (index - 1 + buttons.length) % buttons.length;
          else if (event.key === 'Home') next = 0;
          else if (event.key === 'End') next = buttons.length - 1;
          else return;
          event.preventDefault();
          buttons[next]?.focus();
        }}>
          {options.map(option => (
            <li key={option.value} role="presentation">
              <button type="button" role="option" aria-selected={option.value === value}
                autoFocus={option.value === value}
                className={option.value === value ? 'sort-option selected' : 'sort-option'}
                onClick={() => {
                  onChange(option.value);
                  setOpen(false);
                  triggerRef.current?.focus();
                }}>
                <span className="option-check">{option.value === value && <Icon name="check" />}</span>
                {option.label}
              </button>
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
  projects,
  selectedProject,
  onProjectChange,
  visibleCount,
  totalCount,
  onReset,
}: FiltersProps) {
  const hasActiveFilters = !!search || !!selectedProject || sortBy !== 'newest';

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

        <Dropdown value={selectedProject} onChange={onProjectChange}
          options={[{ label: 'All projects', value: '' }, ...projects.map(project => ({ label: project, value: project }))]}
          label="Filter by project" icon="book" />
        <Dropdown value={sortBy} onChange={onSortChange} options={SORT_OPTIONS}
          label="Sort contributions" icon="sort" />

        {hasActiveFilters && (
          <button type="button" className="reset-btn" onClick={onReset}>
            Clear all
          </button>
        )}
      </div>

      <span className="filter-count">
        {visibleCount === totalCount ? `${totalCount} contributions` : `${visibleCount} of ${totalCount}`}
      </span>
    </div>
  );
}
