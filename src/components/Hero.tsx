import redPushpin from '../assets/red-pushpin-real.png';
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
  stats: SiteStats;
}

function Metric({ label, value, tone }: { label: string; value: string | number; tone?: 'green' | 'red' | 'blue' }) {
  return (
    <div className={`metric ${tone ? `metric-${tone}` : ''}`}>
      <span className="metric-star" aria-hidden="true">✳</span>
      <span className="metric-label">{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

export function DeveloperProfile({ contributor }: { contributor: Contributor }) {
  const contributorName = contributor.name || contributor.username;

  return (
    <aside className="developer-profile" aria-label="Developer GitHub profile">
      <img className="profile-pin" src={redPushpin} alt="" aria-hidden="true" />
      <img className="developer-avatar" src={`https://github.com/${contributor.username}.png?size=320`} alt={`${contributorName}'s GitHub avatar`} />
      <h2>{contributorName}</h2>
      <a className="developer-handle" href={contributor.profile_url} target="_blank" rel="noreferrer">@{contributor.username}</a>
      {contributor.bio && <p>{contributor.bio}</p>}
      <div className="profile-links">
        <a href={contributor.profile_url} target="_blank" rel="noreferrer"><Icon name="github" /> GitHub profile ↗</a>
        {contributor.location && <span><Icon name="pin" />{contributor.location}</span>}
        {contributor.website && <a href={normalizeWebsite(contributor.website)} target="_blank" rel="noreferrer"><Icon name="external" />{contributor.website.replace(/^https?:\/\/(www\.)?/, '')}</a>}
        {contributor.twitter && <a href={`https://twitter.com/${normalizeTwitter(contributor.twitter)}`} target="_blank" rel="noreferrer"><Icon name="external" />@{normalizeTwitter(contributor.twitter)}</a>}
        {contributor.email && <a href={`mailto:${contributor.email}`}><Icon name="mail" />{contributor.email}</a>}
      </div>
    </aside>
  );
}

export function Hero({ stats }: HeroProps) {

  return (
    <section className="hero">
      <div className="hero-panel" aria-label="Contribution summary">
        <Metric label="Merged PRs" value={stats.prs} tone="blue" />
        <Metric label="Repositories" value={stats.repos} />
        <Metric label="Lines added" value={`+${formatNumber(stats.additions)}`} tone="green" />
        <Metric label="Lines removed" value={`-${formatNumber(stats.deletions)}`} tone="red" />
      </div>
    </section>
  );
}
