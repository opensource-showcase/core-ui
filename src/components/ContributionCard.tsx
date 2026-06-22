import type { EnrichedContribution } from '../types.ts';
import { formatDate, formatFullNumber } from '../utils/format.ts';
import { renderMarkdown } from '../utils/markdown.ts';
import { Icon } from './Icon.tsx';

interface ContributionCardProps {
  contribution: EnrichedContribution;
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function ContributionCard({ contribution: pr, expanded, onToggleExpanded }: ContributionCardProps) {
  const reviewers = pr.reviewers?.slice(0, 5) ?? [];

  return (
    <section className="pr-item">
      <div className="pr-main">
        <div className="branch-mark">
          <Icon name="branch" />
        </div>

        <div className="pr-content">
          <div className="pr-title-row">
            <a href={pr.pr_url} target="_blank" rel="noreferrer">
              {pr.pr_title}
            </a>
            <span>#{pr.pr_number}</span>
            {pr.impact && <strong className={`impact impact-${pr.impact}`}>{pr.impact}</strong>}
          </div>

          <div className="pr-subline">
            <span>Merged {formatDate(pr.merged_at)}</span>
            {pr.language && <span>{pr.language}</span>}
            <span>
              {pr.files_changed} file{pr.files_changed === 1 ? '' : 's'}
            </span>
            <span className="diff-add">+{formatFullNumber(pr.additions)}</span>
            <span className="diff-del">-{formatFullNumber(pr.deletions)}</span>
          </div>

          {pr.note && <p className="impact-note">{pr.note}</p>}

          {pr.labels.length > 0 && (
            <div className="label-row">
              {pr.labels.slice(0, 8).map((label) => (
                <span key={label}>{label}</span>
              ))}
            </div>
          )}

          <div className="review-row">
            {reviewers.length > 0 ? (
              <>
                <span>Reviewed by</span>
                <div className="avatar-stack">
                  {reviewers.map((reviewer) => (
                    <a key={reviewer.login} href={`https://github.com/${reviewer.login}`} target="_blank" rel="noreferrer" title={reviewer.login}>
                      <img src={reviewer.avatar_url} alt={reviewer.login} />
                    </a>
                  ))}
                </div>
              </>
            ) : pr.merged_by ? (
              <span>
                Merged by <a href={`https://github.com/${pr.merged_by}`} target="_blank" rel="noreferrer">@{pr.merged_by}</a>
              </span>
            ) : null}
          </div>

          {pr.pr_body?.trim() && (
            <div className="description-block">
              <button type="button" onClick={onToggleExpanded} aria-expanded={expanded}>
                {expanded ? 'Hide description' : 'Read description'}
                <Icon name="chevron" />
              </button>
              {expanded && <div className="markdown-content" dangerouslySetInnerHTML={renderMarkdown(pr.pr_body)} />}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
