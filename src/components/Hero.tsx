import type { Contributor } from '../types.ts';

interface SiteStats {
  prs: number;
  repos: number;
  additions: number;
  deletions: number;
}

interface HeroProps {
  contributor: Contributor;
  stats: SiteStats;
}

function StatCard({ label, value, colorClass }: { label: string; value: string; colorClass?: string }) {
  return (
    <div className="rounded-xl border border-slate-200 dark:border-slate-900 bg-white/50 dark:bg-slate-900/50 p-5 shadow-sm backdrop-blur">
      <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
        {label}
      </span>
      <span className={`text-3xl font-black tracking-tight mt-1 block ${colorClass ?? ''}`}>
        {value}
      </span>
    </div>
  );
}

export function Hero({ contributor, stats }: HeroProps) {
  return (
    <section className="relative overflow-hidden pt-12 pb-16 border-b border-slate-200 dark:border-slate-900">
      <div className="absolute inset-0 bg-gradient-to-tr from-indigo-500/5 via-transparent to-pink-500/5 dark:from-indigo-900/10 dark:to-pink-900/10 pointer-events-none" />

      <div className="max-w-6xl mx-auto px-4 relative">
        <div className="max-w-3xl">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 mb-6">
            <span className="h-1.5 w-1.5 rounded-full bg-indigo-500 animate-pulse" />
            Verified Open Source Portfolio
          </span>

          <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4 text-slate-900 dark:text-slate-100">
            My Open Source Contributions
          </h1>

          {contributor.bio && (
            <p className="text-lg text-slate-600 dark:text-slate-400 mb-6 font-medium leading-relaxed">
              {contributor.bio}
            </p>
          )}

          <div className="flex flex-wrap gap-4 text-sm text-slate-500 dark:text-slate-400">
            {contributor.location && (
              <span className="flex items-center gap-1">📍 {contributor.location}</span>
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

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-12">
          <StatCard label="Merged PRs" value={String(stats.prs)} />
          <StatCard label="Repositories" value={String(stats.repos)} />
          <StatCard
            label="Code Additions"
            value={`+${stats.additions.toLocaleString()}`}
            colorClass="text-emerald-600 dark:text-emerald-500"
          />
          <StatCard
            label="Code Deletions"
            value={`-${stats.deletions.toLocaleString()}`}
            colorClass="text-rose-600 dark:text-rose-500"
          />
        </div>
      </div>
    </section>
  );
}
