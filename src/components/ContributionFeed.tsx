import type { EnrichedContribution } from '../types.ts';
import { formatFullNumber, formatNumber } from '../utils/format.ts';
import { ContributionCard } from './ContributionCard.tsx';

interface ContributionFeedProps {
  groups: Array<[string, EnrichedContribution[]]>;
  filesChanged: number;
  expandedPRs: Record<string, boolean>;
  onTogglePR: (id: string) => void;
  onReset: () => void;
}

export function ContributionFeed({ groups, filesChanged, expandedPRs, onTogglePR, onReset }: ContributionFeedProps) {
  return (
    <section className="contribution-feed" aria-label="Open source contributions">
      <div className="feed-header">
        <div>
          <span className="eyebrow">Contribution feed</span>
          <h2>{groups.length} active project{groups.length === 1 ? '' : 's'}</h2>
        </div>
        <span>
          {formatFullNumber(filesChanged)} file{filesChanged === 1 ? '' : 's'} changed
        </span>
      </div>

      {groups.length === 0 ? (
        <div className="empty-state">
          <h3>No matching contributions</h3>
          <p>Try a broader search or clear the selected filters.</p>
          <button type="button" onClick={onReset}>
            Clear filters
          </button>
        </div>
      ) : (
        groups.map(([repo, prList]) => {
          const firstPr = prList[0];
          const [owner] = repo.split('/');

          return (
            <article className="repo-card" key={repo}>
              <header className="repo-header">
                <img src={`https://github.com/${owner}.png`} alt={owner} />
                <div>
                  <a href={`https://github.com/${repo}`} target="_blank" rel="noreferrer">
                    {repo}
                  </a>
                  {firstPr?.repo_description && <p>{firstPr.repo_description}</p>}
                </div>
                <div className="repo-meta">
                  <span>{formatNumber(firstPr?.repo_stars ?? 0)} stars</span>
                  <span>
                    {prList.length} PR{prList.length === 1 ? '' : 's'}
                  </span>
                </div>
              </header>

              <div className="pr-list">
                {prList.map((pr) => {
                  const prId = `${pr.repo}-${pr.pr_number}`;
                  return (
                    <ContributionCard
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
