import type { Contributor } from '../types.ts';
import { formatNumber, normalizeTwitter, normalizeWebsite } from '../utils/format.ts';
import { Icon } from './Icon.tsx';

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

function Metric({ label, value, tone }: { label: string; value: string | number; tone?: 'green' | 'red' | 'blue' }) {
  return (
    <div className={`metric ${tone ? `metric-${tone}` : ''}`}>
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function Hero({ contributor, stats }: HeroProps) {
  const contributorName = contributor.name || contributor.username;

  return (
    <section className="hero">
      <div className="hero-copy">
        <span className="eyebrow">Open source contribution portfolio</span>
        <h1>{contributorName}</h1>
        <p>{contributor.bio || `A curated record of ${contributorName}'s merged open source pull requests.`}</p>

        <div className="profile-links">
          <a href={contributor.profile_url} target="_blank" rel="noreferrer">
            <Icon name="github" />
            GitHub profile
          </a>
          {contributor.website && (
            <a href={normalizeWebsite(contributor.website)} target="_blank" rel="noreferrer">
              <Icon name="external" />
              {contributor.website.replace(/^https?:\/\/(www\.)?/, '')}
            </a>
          )}
          {contributor.twitter && (
            <a href={`https://twitter.com/${normalizeTwitter(contributor.twitter)}`} target="_blank" rel="noreferrer">
              @{normalizeTwitter(contributor.twitter)}
            </a>
          )}
          {contributor.location && <span>{contributor.location}</span>}
        </div>
      </div>

      <div className="hero-panel" aria-label="Contribution summary">
        <Metric label="Merged PRs" value={stats.prs} tone="blue" />
        <Metric label="Repositories" value={stats.repos} />
        <Metric label="Lines added" value={`+${formatNumber(stats.additions)}`} tone="green" />
        <Metric label="Lines removed" value={`-${formatNumber(stats.deletions)}`} tone="red" />
      </div>
    </section>
  );
}
