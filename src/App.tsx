import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { ContributionFeed } from './components/ContributionFeed.tsx';
import { Filters, type SortOption } from './components/Filters.tsx';
import { DeveloperProfile, Hero } from './components/Hero.tsx';
import { Navbar } from './components/Navbar.tsx';
import { StateScreen } from './components/StateScreen.tsx';
import type { ContributionsData, EnrichedContribution } from './types.ts';

declare global {
  interface Window {
    __SHOWCASE_DATA__?: ContributionsData;
  }
}

function getInitialTheme() {
  if (typeof window === 'undefined') return false;

  return localStorage.getItem('notebook-theme') === 'classic';
}

function groupByRepository(contributions: EnrichedContribution[]) {
  const groups = new Map<string, EnrichedContribution[]>();

  contributions.forEach((item) => {
    groups.set(item.repo, [...(groups.get(item.repo) ?? []), item]);
  });

  return Array.from(groups.entries()).sort((a, b) => (b[1][0]?.repo_stars ?? 0) - (a[1][0]?.repo_stars ?? 0));
}

export default function App() {
  const [data, setData] = useState<ContributionsData | null>(() => window.__SHOWCASE_DATA__ ?? null);
  const [loading, setLoading] = useState(() => !window.__SHOWCASE_DATA__);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  const [page, setPage] = useState(1);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [expandedPRs, setExpandedPRs] = useState<Record<string, boolean>>({});
  const [darkMode, setDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.remove('dark');
    localStorage.setItem('notebook-theme', darkMode ? 'classic' : 'cream');
  }, [darkMode]);

  useEffect(() => {
    if (data) return;

    fetch('./contributions.json')
      .then((res) => {
        if (!res.ok) throw new Error(`Failed to load contributions.json: ${res.statusText}`);
        return res.json();
      })
      .then((jsonData: ContributionsData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch((err: Error) => {
        setError(err.message || 'Failed to load contributions data.');
        setLoading(false);
      });
  }, [data]);

  const shownContributions = useMemo(() => data?.contributions.filter((item) => item.showcase) ?? [], [data]);

  const stats = useMemo(() => {
    const repos = new Set(shownContributions.map((item) => item.repo));

    return {
      prs: shownContributions.length,
      repos: repos.size,
      additions: shownContributions.reduce((total, item) => total + item.additions, 0),
      deletions: shownContributions.reduce((total, item) => total + item.deletions, 0),
      files: shownContributions.reduce((total, item) => total + item.files_changed, 0),
    };
  }, [shownContributions]);

  const filteredContributions = useMemo(() => {
    const term = search.trim().toLowerCase();

    return shownContributions
      .filter((item) => {
        const matchesSearch =
          !term ||
          item.pr_title.toLowerCase().includes(term) ||
          item.repo.toLowerCase().includes(term) ||
          item.repo_description?.toLowerCase().includes(term) ||
          item.note?.toLowerCase().includes(term) ||
          item.labels.some((label) => label.toLowerCase().includes(term));

        return matchesSearch && (!selectedProject || item.repo === selectedProject);
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') return new Date(a.merged_at).getTime() - new Date(b.merged_at).getTime();
        if (sortBy === 'stars') return b.repo_stars - a.repo_stars;
        if (sortBy === 'additions') return b.additions - a.additions;
        return new Date(b.merged_at).getTime() - new Date(a.merged_at).getTime();
      });
  }, [search, selectedProject, shownContributions, sortBy]);

  const projects = useMemo(() => Array.from(new Set(shownContributions.map(item => item.repo))).sort(), [shownContributions]);
  const pageSize = 10;
  const pageCount = Math.max(1, Math.ceil(filteredContributions.length / pageSize));
  const currentPage = Math.min(page, pageCount);
  const pageStart = (currentPage - 1) * pageSize;
  const pageContributions = filteredContributions.slice(pageStart, pageStart + pageSize);
  const groupedContributions = groupByRepository(pageContributions);
  const pageNumbers = Array.from(new Set([1, currentPage - 1, currentPage, currentPage + 1, pageCount]))
    .filter(value => value >= 1 && value <= pageCount).sort((a, b) => a - b);
  const changePage = (value: number) => {
    setPage(value);
    document.getElementById('contribution-results')?.scrollIntoView({ block: 'start', behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'instant' : 'smooth' });
  };

  const resetFilters = () => {
    setSearch('');
    setSelectedProject('');
    setPage(1);
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className={`showcase-shell ${darkMode ? 'classic' : ''}`}>
        <StateScreen loading title="Loading portfolio" description="Collecting contribution details." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`showcase-shell ${darkMode ? 'classic' : ''}`}>
        <StateScreen title="Could not load contributions" description={error || 'The contributions.json file could not be found.'} code="opensource-showcase" />
      </div>
    );
  }

  return (
    <div className={`showcase-shell ${darkMode ? 'classic' : ''}`}>
      <header className="field-nav">
        <a className="field-wordmark" href={data.contributor.profile_url} target="_blank" rel="noreferrer">
          <span className="field-monogram">{(data.contributor.name || data.contributor.username).slice(0, 1).toLowerCase()}.</span>
          <span>{data.contributor.name || data.contributor.username}<small>open source / field notes</small></span>
        </a>
        <div className="field-nav-actions">
          <a href="#contribution-results">Contributions</a>
          <a href={data.contributor.profile_url} target="_blank" rel="noreferrer">GitHub ↗</a>
          <Navbar darkMode={darkMode} onToggleDarkMode={() => setDarkMode((value) => !value)} />
        </div>
      </header>
      <div className="book-spread">
        <aside className="book-cover" aria-label="Notebook cover">
          <h1 className="cover-page-title">Open source<br /><em>contributions.</em></h1>
          <div className="profile-column"><DeveloperProfile contributor={data.contributor} /></div>
        </aside>
      <div className="notebook-layout">
        <div className="binder-holes" aria-hidden="true"><span /><span /><span /></div>
        <div className="paper-meta"><span>Engineering field notes</span><span>Open source</span></div>
        <div className="notebook-overview">
          <Hero stats={stats} />
        </div>
        <main>
        <section className="content-section">
          <Filters
            search={search}
            onSearchChange={(value) => { setSearch(value); setPage(1); }}
            sortBy={sortBy}
            onSortChange={(value) => { setSortBy(value); setPage(1); }}
            projects={projects}
            selectedProject={selectedProject}
            onProjectChange={(value) => { setSelectedProject(value); setPage(1); }}
            visibleCount={filteredContributions.length}
            totalCount={shownContributions.length}
            onReset={resetFilters}
          />

          <div id="contribution-results" aria-live="polite">
          <ContributionFeed
            startIndex={pageStart}
            groups={groupedContributions}
            expandedPRs={expandedPRs}
            onTogglePR={(id) => setExpandedPRs((current) => ({ ...current, [id]: !current[id] }))}
            onReset={resetFilters}
          />
          </div>
          {filteredContributions.length > 0 && (
            <nav className="pagination" aria-label="Contribution pages">
              <span className="page-summary">{pageStart + 1}–{Math.min(pageStart + pageSize, filteredContributions.length)} of {filteredContributions.length} contributions</span>
              <div className="page-controls">
                <button type="button" disabled={currentPage === 1} onClick={() => changePage(currentPage - 1)}>← Previous</button>
                {pageNumbers.map((number, index) => (
                  <span className="page-number" key={number}>
                    {index > 0 && number - pageNumbers[index - 1]! > 1 && <span className="page-gap" aria-hidden="true">…</span>}
                    <button type="button" aria-label={`Page ${number}`} aria-current={number === currentPage ? 'page' : undefined} onClick={() => changePage(number)}>{number}</button>
                  </span>
                ))}
                <button type="button" disabled={currentPage === pageCount} onClick={() => changePage(currentPage + 1)}>Next →</button>
              </div>
            </nav>
          )}
        </section>
      <footer className="site-footer">
        <span>Updated {new Date(data.updated_at).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
        <span>© {new Date().getFullYear()} {data.contributor.name || data.contributor.username} · All rights reserved</span>
      </footer>
        </main>
      </div>
      </div>




    </div>
  );
}
