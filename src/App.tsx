import { useState, useEffect, useMemo } from 'react';
import { marked } from 'marked';
import DOMPurify from 'dompurify';

// Setup marked options
marked.setOptions({
  gfm: true,
  breaks: false,
});

interface Contributor {
  username: string;
  profile_url: string;
  name?: string;
  email?: string;
  bio?: string;
  location?: string;
  website?: string;
  twitter?: string;
}

interface EnrichedContribution {
  repo: string;
  pr_number: number;
  pr_title: string;
  pr_url: string;
  pr_body?: string;
  merged_at: string;
  language: string | null;
  repo_stars: number;
  repo_description: string | null;
  labels: string[];
  additions: number;
  deletions: number;
  files_changed: number;
  showcase: boolean;
  note?: string;
  impact?: 'low' | 'medium' | 'high';
  reviewers?: Array<{ login: string; avatar_url: string }>;
  merged_by?: string;
}

interface ContributionsData {
  version: string;
  updated_at: string;
  contributor: Contributor;
  contributions: EnrichedContribution[];
}

declare global {
  interface Window {
    __SHOWCASE_DATA__?: ContributionsData;
  }
}

// Simple helper to safely render markdown to HTML
const renderMarkdown = (text?: string) => {
  if (!text) return { __html: '' };
  try {
    const rawHtml = marked.parse(text) as string;
    const cleanHtml = DOMPurify.sanitize(rawHtml);
    return { __html: cleanHtml };
  } catch {
    return { __html: text };
  }
};

export default function App() {
  const [data, setData] = useState<ContributionsData | null>(() => {
    if (typeof window !== 'undefined' && window.__SHOWCASE_DATA__) {
      return window.__SHOWCASE_DATA__;
    }
    return null;
  });
  const [loading, setLoading] = useState(() => {
    if (typeof window !== 'undefined' && window.__SHOWCASE_DATA__) {
      return false;
    }
    return true;
  });
  const [error, setError] = useState<string | null>(null);

  // Search & Filter state
  const [search, setSearch] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [selectedImpact, setSelectedImpact] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'stars' | 'additions'>('newest');
  const [expandedPRs, setExpandedPRs] = useState<Record<string, boolean>>({});

  // Theme state
  const [darkMode, setDarkMode] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return true;
  });

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
    }
  }, [darkMode]);

  // Load contributions
  useEffect(() => {
    if (data) return;

    // Fetch locally relative to showcase URL
    fetch('./contributions.json')
      .then((res) => {
        if (!res.ok) {
          throw new Error(`Failed to load contributions.json: ${res.statusText}`);
        }
        return res.json();
      })
      .then((jsonData) => {
        setData(jsonData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError(err.message || 'Failed to load contributions data.');
        setLoading(false);
      });
  }, [data]);

  const togglePR = (id: string) => {
    setExpandedPRs((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Compute languages list
  const allLanguages = useMemo(() => {
    if (!data) return [];
    const langs = new Set<string>();
    data.contributions.forEach((c) => {
      if (c.language) langs.add(c.language);
    });
    return Array.from(langs).sort();
  }, [data]);

  // Filtered and Grouped contributions
  const filteredContributions = useMemo(() => {
    if (!data) return [];

    return data.contributions
      .filter((c) => {
        if (!c.showcase) return false;

        const matchesSearch =
          c.pr_title.toLowerCase().includes(search.toLowerCase()) ||
          c.repo.toLowerCase().includes(search.toLowerCase()) ||
          (c.note && c.note.toLowerCase().includes(search.toLowerCase())) ||
          (c.repo_description && c.repo_description.toLowerCase().includes(search.toLowerCase()));

        const matchesLanguage = !selectedLanguage || c.language === selectedLanguage;
        const matchesImpact = !selectedImpact || c.impact === selectedImpact;

        return matchesSearch && matchesLanguage && matchesImpact;
      })
      .sort((a, b) => {
        if (sortBy === 'newest') {
          return new Date(b.merged_at).getTime() - new Date(a.merged_at).getTime();
        }
        if (sortBy === 'oldest') {
          return new Date(a.merged_at).getTime() - new Date(b.merged_at).getTime();
        }
        if (sortBy === 'stars') {
          return b.repo_stars - a.repo_stars;
        }
        if (sortBy === 'additions') {
          return b.additions - a.additions;
        }
        return 0;
      });
  }, [data, search, selectedLanguage, selectedImpact, sortBy]);

  // Group by repository for display
  const groupedContributions = useMemo(() => {
    const groups: Record<string, EnrichedContribution[]> = {};
    filteredContributions.forEach((c) => {
      if (!groups[c.repo]) {
        groups[c.repo] = [];
      }
      groups[c.repo].push(c);
    });

    // Sort the repository keys by stars of the first contribution in that repo
    return Object.entries(groups).sort((a, b) => {
      const starsA = a[1][0]?.repo_stars ?? 0;
      const starsB = b[1][0]?.repo_stars ?? 0;
      return starsB - starsA;
    });
  }, [filteredContributions]);

  // General Stats
  const stats = useMemo(() => {
    if (!data) return { prs: 0, repos: 0, additions: 0, deletions: 0 };
    const shown = data.contributions.filter((c) => c.showcase);
    const uniqueRepos = new Set(shown.map((c) => c.repo));
    let adds = 0;
    let dels = 0;
    shown.forEach((c) => {
      adds += c.additions;
      dels += c.deletions;
    });
    return {
      prs: shown.length,
      repos: uniqueRepos.size,
      additions: adds,
      deletions: dels,
    };
  }, [data]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
        <div className="flex flex-col items-center gap-4">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Loading showcase portfolio...</p>
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-slate-950 p-6">
        <div className="max-w-md w-full rounded-2xl border border-red-200 dark:border-red-950 bg-white dark:bg-slate-900 p-8 text-center shadow-lg">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-red-100 dark:bg-red-950/30 text-red-600 dark:text-red-400 mb-4">
            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 mb-2">Failed to Load Showcase</h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mb-6">{error || 'Could not fetch contributions.json file.'}</p>
          <div className="text-xs text-left bg-slate-100 dark:bg-slate-950 p-3 rounded font-mono text-slate-600 dark:text-slate-400 overflow-x-auto">
            Please run <code className="bg-slate-200 dark:bg-slate-800 px-1 py-0.5 rounded">opensource-showcase</code> in your terminal to generate contributions details first.
          </div>
        </div>
      </div>
    );
  }

  const { contributor, updated_at } = data;
  const contributorName = contributor.name || contributor.username;

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-200 pb-20">
      {/* Sticky Header Navbar */}
      <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img
              src={`https://github.com/${contributor.username}.png`}
              alt={contributorName}
              className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800"
            />
            <div>
              <h1 className="text-md font-bold leading-tight tracking-tight">{contributorName}</h1>
              <a
                href={contributor.profile_url}
                target="_blank"
                rel="noreferrer"
                className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                @{contributor.username}
              </a>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Theme Toggle */}
            <button
              onClick={() => setDarkMode(!darkMode)}
              className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
              aria-label="Toggle theme"
            >
              {darkMode ? (
                <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707M16.242 16.242L12 12l-4.242 4.242L12 12z" />
                </svg>
              ) : (
                <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                </svg>
              )}
            </button>
            <a
              href="https://github.com/opensource-showcase/opensource-showcase"
              target="_blank"
              rel="noreferrer"
              className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            >
              Get CLI Tool
            </a>
          </div>
        </div>
      </header>

      {/* Hero section */}
      <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-200 dark:border-slate-900">
        <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-pink-500/5 dark:from-indigo-900/10 dark:to-pink-900/10 pointer-events-none" />
        <div className="max-w-6xl mx-auto px-4 relative">
          <div className="max-w-3xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 mb-6">
              <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
              Verified Open Source Portfolio
            </span>
            <h2 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">
              My Open Source Contributions
            </h2>
            {contributor.bio && (
              <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
                {contributor.bio}
              </p>
            )}
            <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
              {contributor.location && (
                <span className="flex items-center gap-1">
                  📍 {contributor.location}
                </span>
              )}
              {contributor.website && (
                <a
                  href={contributor.website}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  🔗 {contributor.website.replace(/^https?:\/\/(www\.)?/, '')}
                </a>
              )}
              {contributor.twitter && (
                <a
                  href={`https://twitter.com/${contributor.twitter}`}
                  target="_blank"
                  rel="noreferrer"
                  className="flex items-center gap-1 text-indigo-600 dark:text-indigo-400 hover:underline"
                >
                  🐦 @{contributor.twitter}
                </a>
              )}
            </div>
          </div>

          {/* Stats Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
            <div className="rounded-xl border border-slate-200 dark:border-slate-900 bg-white/50 dark:bg-slate-900/50 p-5 shadow-sm backdrop-blur">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Merged PRs</span>
              <span className="text-3xl font-black tracking-tight mt-1 block">{stats.prs}</span>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-900 bg-white/50 dark:bg-slate-900/50 p-5 shadow-sm backdrop-blur">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Repositories</span>
              <span className="text-3xl font-black tracking-tight mt-1 block">{stats.repos}</span>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-900 bg-white/50 dark:bg-slate-900/50 p-5 shadow-sm backdrop-blur">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Code Additions</span>
              <span className="text-3xl font-black tracking-tight text-emerald-600 dark:text-emerald-500 mt-1 block">+{stats.additions.toLocaleString()}</span>
            </div>
            <div className="rounded-xl border border-slate-200 dark:border-slate-900 bg-white/50 dark:bg-slate-900/50 p-5 shadow-sm backdrop-blur">
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Code Deletions</span>
              <span className="text-3xl font-black tracking-tight text-rose-600 dark:text-rose-500 mt-1 block">-{stats.deletions.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content Area */}
      <main className="max-w-6xl mx-auto px-4 mt-12 grid grid-cols-1 lg:grid-cols-4 gap-8">
        {/* Filters Sidebar */}
        <aside className="lg:col-span-1 space-y-6">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-6">
            <h3 className="font-bold text-lg">Filters & Search</h3>

            {/* Search Input */}
            <div className="space-y-2">
              <label htmlFor="search-input" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Search
              </label>
              <input
                id="search-input"
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search PR title, project..."
                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:focus:ring-indigo-400"
              />
            </div>

            {/* Sort Dropdown */}
            <div className="space-y-2">
              <label htmlFor="sort-select" className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                Sort By
              </label>
              <select
                id="sort-select"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'newest' | 'oldest' | 'stars' | 'additions')}
                className="w-full text-sm rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 px-3 py-2 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="newest">Latest Merged</option>
                <option value="oldest">Oldest Merged</option>
                <option value="stars">Stars Count</option>
                <option value="additions">Code Size Addition</option>
              </select>
            </div>

            {/* Impact Filter */}
            {data.contributions.some((c) => c.impact) && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Impact Rating
                </span>
                <div className="flex flex-wrap gap-2">
                  {['all', 'high', 'medium', 'low'].map((impact) => (
                    <button
                      key={impact}
                      onClick={() => setSelectedImpact(impact === 'all' ? null : impact)}
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold border cursor-pointer capitalize transition-all ${
                        (impact === 'all' && !selectedImpact) || selectedImpact === impact
                          ? 'bg-indigo-600 border-indigo-600 text-white dark:bg-indigo-500 dark:border-indigo-500'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-850 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {impact}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Languages list */}
            {allLanguages.length > 0 && (
              <div className="space-y-2">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
                  Language Focus
                </span>
                <div className="flex flex-wrap gap-1.5">
                  <button
                    onClick={() => setSelectedLanguage(null)}
                    className={`text-xs px-2.5 py-1 rounded-full font-semibold border cursor-pointer transition ${
                      !selectedLanguage
                        ? 'bg-indigo-600 border-indigo-600 text-white dark:bg-indigo-500'
                        : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    All Languages
                  </button>
                  {allLanguages.map((lang) => (
                    <button
                      key={lang}
                      onClick={() => setSelectedLanguage(lang)}
                      className={`text-xs px-2.5 py-1 rounded-full font-semibold border cursor-pointer transition ${
                        selectedLanguage === lang
                          ? 'bg-indigo-600 border-indigo-600 text-white dark:bg-indigo-505 dark:bg-indigo-500'
                          : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                      }`}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>
        </aside>

        {/* Contributions List */}
        <section className="lg:col-span-3 space-y-8">
          {groupedContributions.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-slate-200 dark:border-slate-800 p-12 text-center text-slate-500 dark:text-slate-400 bg-white/30 dark:bg-slate-900/30">
              <svg className="mx-auto h-12 w-12 text-slate-300 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <h3 className="font-semibold text-lg mb-1">No Contributions Found</h3>
              <p className="text-sm">Try relaxing your search terms or removing language filters.</p>
            </div>
          ) : (
            groupedContributions.map(([repo, prList]) => {
              const firstPr = prList[0];
              const [owner] = repo.split('/');

              return (
                <div key={repo} className="rounded-2xl border border-slate-200 dark:border-slate-900 bg-white dark:bg-slate-900 shadow-sm overflow-hidden transition-all duration-300">
                  {/* Repo Header */}
                  <div className="bg-slate-50/50 dark:bg-slate-950/20 border-b border-slate-200/60 dark:border-slate-800/60 px-6 py-5 flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <img
                        src={`https://github.com/${owner}.png`}
                        alt={owner}
                        className="h-10 w-10 rounded-lg border border-slate-200 dark:border-slate-800 mt-1"
                      />
                      <div>
                        <div className="flex items-center flex-wrap gap-2">
                          <a
                            href={`https://github.com/${repo}`}
                            target="_blank"
                            rel="noreferrer"
                            className="font-bold text-lg text-slate-900 dark:text-slate-100 hover:text-indigo-600 dark:hover:text-indigo-400 hover:underline"
                          >
                            {repo}
                          </a>
                        </div>
                        {firstPr.repo_description && (
                          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed max-w-xl">
                            {firstPr.repo_description}
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 self-end md:self-center">
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-350">
                        ★ {firstPr.repo_stars.toLocaleString()}
                      </span>
                      <span className="text-xs font-semibold px-2.5 py-1 rounded bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300">
                        {prList.length} Merged PR{prList.length === 1 ? '' : 's'}
                      </span>
                    </div>
                  </div>

                  {/* PRs list inside repo */}
                  <div className="divide-y divide-slate-150 dark:divide-slate-800">
                    {prList.map((pr) => {
                      const prId = `${pr.repo}-${pr.pr_number}`;
                      const isExpanded = !!expandedPRs[prId];
                      const dateString = new Date(pr.merged_at).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric',
                      });

                      return (
                        <article key={prId} className="p-6 transition hover:bg-slate-50/20 dark:hover:bg-slate-900/20">
                          {/* Top Heading */}
                          <div className="flex items-start justify-between gap-4">
                            <div className="space-y-1 min-w-0">
                              <div className="flex items-center flex-wrap gap-2 text-indigo-600 dark:text-indigo-400 font-bold">
                                <span className="text-purple-600 dark:text-purple-400 flex items-center shrink-0">
                                  <svg className="h-4 w-4 fill-current" viewBox="0 0 16 16">
                                    <path d="M5 3.25a2.25 2.25 0 1 1-2.75-2.193v9.886A2.25 2.25 0 1 1 .75 13V3.057A2.25 2.25 0 1 1 5 3.25Zm-2.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM14.75 3.25a2.25 2.25 0 0 1-3 2.122v.878A3.75 3.75 0 0 1 8 10H6.75a.75.75 0 0 1 0-1.5H8a2.25 2.25 0 0 0 2.25-2.25v-.878a2.25 2.25 0 1 1 4.5-2.122Zm-2.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
                                  </svg>
                                </span>
                                <a
                                  href={pr.pr_url}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="hover:underline hover:text-indigo-750 font-bold text-[15px] sm:text-md truncate inline-block"
                                >
                                  {pr.pr_title}
                                </a>
                                <span className="text-slate-400 dark:text-slate-500 font-medium text-sm">
                                  #{pr.pr_number}
                                </span>
                              </div>
                              <div className="text-xs text-slate-500 dark:text-slate-400">
                                Merged on {dateString}
                              </div>
                            </div>

                            {/* Impact Tag (if present) */}
                            {pr.impact && (
                              <span className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${
                                pr.impact === 'high'
                                  ? 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-450'
                                  : pr.impact === 'medium'
                                    ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-450'
                                    : 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-450'
                              }`}>
                                {pr.impact} impact
                              </span>
                            )}
                          </div>

                          {/* Impact Note (highlighted) */}
                          {pr.note && (
                            <div className="mt-3 bg-amber-500/10 border-l-4 border-amber-500 p-3 rounded-r-lg text-xs leading-relaxed text-slate-700 dark:text-slate-300">
                              <span className="font-bold text-amber-700 dark:text-amber-400">Impact: </span>
                              {pr.note}
                            </div>
                          )}

                          {/* PR Facts / Stats */}
                          <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-450 mt-4 items-center">
                            {pr.language && (
                              <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-slate-350 dark:bg-slate-600" />
                                <span>{pr.language}</span>
                              </div>
                            )}

                            {/* Diff counters */}
                            <div className="flex items-center gap-2">
                              <span className="font-semibold text-emerald-600 dark:text-emerald-500 font-mono">
                                +{pr.additions.toLocaleString()}
                              </span>
                              <span className="font-semibold text-rose-600 dark:text-rose-500 font-mono">
                                -{pr.deletions.toLocaleString()}
                              </span>
                              <span className="text-slate-350 dark:text-slate-600">|</span>
                              <span>{pr.files_changed} file{pr.files_changed === 1 ? '' : 's'}</span>
                            </div>

                            {/* Reviewers approvals */}
                            {pr.reviewers && pr.reviewers.length > 0 ? (
                              <div className="flex items-center gap-2">
                                <span className="text-slate-400">Approved by:</span>
                                <div className="flex -space-x-1.5">
                                  {pr.reviewers.map((reviewer) => (
                                    <a
                                      key={reviewer.login}
                                      href={`https://github.com/${reviewer.login}`}
                                      target="_blank"
                                      rel="noreferrer"
                                      title={reviewer.login}
                                    >
                                      <img
                                        src={reviewer.avatar_url}
                                        alt={reviewer.login}
                                        className="h-5 w-5 rounded-full border border-white dark:border-slate-900"
                                      />
                                    </a>
                                  ))}
                                </div>
                              </div>
                            ) : pr.merged_by ? (
                              <div>
                                <span className="text-slate-400">Merged by:</span>{' '}
                                <a
                                  href={`https://github.com/${pr.merged_by}`}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="font-semibold text-slate-600 dark:text-slate-300 hover:underline"
                                >
                                  @{pr.merged_by}
                                </a>
                              </div>
                            ) : null}
                          </div>

                          {/* Labels List */}
                          {pr.labels.length > 0 && (
                            <div className="flex flex-wrap gap-1 mt-3">
                              {pr.labels.map((lbl) => (
                                <span key={lbl} className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50">
                                  {lbl}
                                </span>
                              ))}
                            </div>
                          )}

                          {/* Markdown Expander for PR Body */}
                          {pr.pr_body && pr.pr_body.trim() && (
                            <div className="mt-4">
                              <button
                                onClick={() => togglePR(prId)}
                                className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-850 cursor-pointer"
                              >
                                {isExpanded ? 'Collapse description ▲' : 'Show description ▼'}
                              </button>

                              {isExpanded && (
                                <div className="mt-3 text-xs bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80 p-4 rounded-xl prose prose-slate dark:prose-invert max-w-none">
                                  <div
                                    dangerouslySetInnerHTML={renderMarkdown(pr.pr_body)}
                                    className="markdown-content"
                                  />
                                </div>
                              )}
                            </div>
                          )}
                        </article>
                      );
                    })}
                  </div>
                </div>
              );
            })
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-4 mt-20 pt-8 border-t border-slate-200 dark:border-slate-900 text-center text-xs text-slate-450 dark:text-slate-500">
        <p>
          Updated {new Date(updated_at).toLocaleDateString('en-US', { dateStyle: 'long' })}. Data available in{' '}
          <a href="contributions.json" className="text-indigo-600 dark:text-indigo-400 hover:underline">
            contributions.json
          </a>
          .
        </p>
        <p className="mt-1">
          Powered by{' '}
          <a
            href="https://github.com/opensource-showcase/opensource-showcase"
            target="_blank"
            rel="noreferrer"
            className="text-slate-600 dark:text-slate-350 hover:underline"
          >
            opensource-showcase CLI
          </a>
        </p>
      </footer>
    </div>
  );
}
