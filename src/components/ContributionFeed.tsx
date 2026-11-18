import { useState } from 'react';
import type { EnrichedContribution } from '../types.ts';
import { formatNumber } from '../utils/format.ts';
import { Icon } from './Icon.tsx';
import { ContributionCard } from './ContributionCard.tsx';

interface ContributionFeedProps {
  startIndex?: number;
  groups: Array<[string, EnrichedContribution[]]>;
  expandedPRs: Record<string, boolean>;
  onTogglePR: (id: string) => void;
  onReset: () => void;
}

function ProjectLogo({ owner }: { owner: string }) {
  const [failed, setFailed] = useState(false);
  return (
    <span className="project-logo" aria-hidden="true">
      {failed ? <Icon name="book" /> : (
        <img src={`https://github.com/${encodeURIComponent(owner)}.png?size=64`}
          alt="" width={28} height={28} loading="lazy" decoding="async"
          onError={() => setFailed(true)} />
      )}
    </span>
  );
}

export function ContributionFeed({ startIndex = 0, groups, expandedPRs, onTogglePR, onReset }: ContributionFeedProps) {
  return (
    <section className="contribution-feed" aria-label="Open source contributions">


      {groups.length === 0 ? (
        <div className="empty-state">
          <h3>No matching contributions</h3>
          <p>Try a broader search or clear the selected filters.</p>
          <button type="button" onClick={onReset}>
            Clear filters
          </button>
        </div>
      ) : (
        groups.map(([repo, prList], groupIndex) => {
          const firstPr = prList[0];

          return (
            <article className="repo-card" key={repo}>
              <header className="repo-header">
                <div className="repo-intro">
                  <h3 className="repo-title">
                    <a href={`https://github.com/${repo}`} target="_blank" rel="noreferrer" title={repo}>
                      <ProjectLogo key={repo.split('/')[0]} owner={repo.split('/')[0] ?? repo} />
                      <span className="repo-name"><span className="repo-owner">{repo.split('/')[0]} / </span>{repo.split('/').slice(1).join('/')}</span>
                    </a>
                  </h3>
                  {firstPr?.repo_description && <p>{firstPr.repo_description}</p>}
                </div>
                <div className="repo-meta">
                  <span><Icon name="star" /> {formatNumber(firstPr?.repo_stars ?? 0)} stars</span>
                  <span>
                    <Icon name="branch" /> {prList.length} merged PR{prList.length === 1 ? '' : 's'} on this page
                  </span>
                </div>
              </header>

              <div className="pr-list">
                {prList.map((pr, prIndex) => {
                  const prId = `${pr.repo}-${pr.pr_number}`;
                  return (
                    <ContributionCard
                      number={startIndex + groups.slice(0, groupIndex).reduce((sum, [, items]) => sum + items.length, 0) + prIndex + 1}
                      contribution={pr}
                      expanded={Boolean(expandedPRs[prId])}
                      key={prId}
                      onToggleExpanded={() => onTogglePR(prId)}
                    />
                  );
                })}
              </div>
            </article>
          );
        })
      )}
    </section>
  );
}
