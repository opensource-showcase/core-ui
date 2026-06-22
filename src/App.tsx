import { useEffect, useMemo, useState } from 'react';
import './App.css';
import { ContributionFeed } from './components/ContributionFeed.tsx';
import { Filters, type SortOption } from './components/Filters.tsx';
import { Hero } from './components/Hero.tsx';
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

  return (
    localStorage.getItem('theme') === 'dark' ||
    (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches)
  );
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
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedImpact, setSelectedImpact] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [expandedPRs, setExpandedPRs] = useState<Record<string, boolean>>({});
  const [darkMode, setDarkMode] = useState(getInitialTheme);

  useEffect(() => {
    document.documentElement.classList.toggle('dark', darkMode);
    localStorage.setItem('theme', darkMode ? 'dark' : 'light');
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

  const languages = useMemo(() => {
    return Array.from(new Set(shownContributions.map((item) => item.language).filter(Boolean) as string[])).sort();
  }, [shownContributions]);

  const impactOptions = useMemo(() => {
    return ['high', 'medium', 'low'].filter((impact) => shownContributions.some((item) => item.impact === impact));
  }, [shownContributions]);

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

        return matchesSearch && (!selectedLanguage || item.language === selectedLanguage) && (!selectedImpact || item.impact === selectedImpact);
      })
      .sort((a, b) => {
        if (sortBy === 'oldest') return new Date(a.merged_at).getTime() - new Date(b.merged_at).getTime();
        if (sortBy === 'stars') return b.repo_stars - a.repo_stars;
        if (sortBy === 'additions') return b.additions - a.additions;
        return new Date(b.merged_at).getTime() - new Date(a.merged_at).getTime();
      });
  }, [search, selectedImpact, selectedLanguage, shownContributions, sortBy]);

  const groupedContributions = useMemo(() => groupByRepository(filteredContributions), [filteredContributions]);

  const resetFilters = () => {
    setSearch('');
    setSelectedImpact(null);
    setSelectedLanguage(null);
    setSortBy('newest');
  };

  if (loading) {
    return (
      <div className={`showcase-shell ${darkMode ? 'dark' : ''}`}>
        <StateScreen loading title="Loading portfolio" description="Collecting contribution details." />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className={`showcase-shell ${darkMode ? 'dark' : ''}`}>
        <StateScreen title="Could not load contributions" description={error || 'The contributions.json file could not be found.'} code="opensource-showcase" />
      </div>
    );
  }

  return (
    <div className={`showcase-shell ${darkMode ? 'dark' : ''}`}>
      <Navbar contributor={data.contributor} darkMode={darkMode} onToggleDarkMode={() => setDarkMode((value) => !value)} />

      <main>
        <Hero contributor={data.contributor} stats={stats} />

        <section className="content-grid">
          <Filters
            search={search}
            onSearchChange={setSearch}
            sortBy={sortBy}
            onSortChange={setSortBy}
            languages={languages}
            selectedLanguage={selectedLanguage}
            onLanguageChange={setSelectedLanguage}
            impactOptions={impactOptions}
            selectedImpact={selectedImpact}
            onImpactChange={setSelectedImpact}
            visibleCount={filteredContributions.length}
            totalCount={shownContributions.length}
            onReset={resetFilters}
          />

          <ContributionFeed
            groups={groupedContributions}
            filesChanged={stats.files}
            expandedPRs={expandedPRs}
            onTogglePR={(id) => setExpandedPRs((current) => ({ ...current, [id]: !current[id] }))}
            onReset={resetFilters}
          />
        </section>
      </main>

      <footer className="site-footer">
        <span>Updated {new Date(data.updated_at).toLocaleDateString('en-US', { dateStyle: 'long' })}</span>
        <a href="contributions.json">View contribution data</a>
      </footer>
    </div>
  );
}
