import { useId } from 'react';
import type { EnrichedContribution } from '../types.ts';
import { formatDate, formatFullNumber } from '../utils/format.ts';
import { renderMarkdown } from '../utils/markdown.ts';
import { Icon } from './Icon.tsx';

interface ContributionCardProps {
  number: number;
  contribution: EnrichedContribution;
  expanded: boolean;
  onToggleExpanded: () => void;
}

export function ContributionCard({ number, contribution: pr, expanded, onToggleExpanded }: ContributionCardProps) {
  const detailsId = useId();
  const reviewers = pr.reviewers?.slice(0, 5) ?? [];

  return (
    <section className="pr-item">
      <div className="pr-main">
        <div className="pr-content">
          <button className="pr-expand-trigger" type="button" onClick={onToggleExpanded}
            aria-expanded={expanded} aria-controls={detailsId}>
            <span className="pr-entry-number">{number}.</span>
            <span className="pr-collapsed-title">{pr.pr_title}</span>
            <span className="pr-collapsed-number">#{pr.pr_number}</span>
            <Icon name="chevron" />
          </button>
          <div id={detailsId} className="description-reveal pr-details-reveal" data-expanded={expanded}
            aria-hidden={!expanded} inert={!expanded}>
            <div className="description-reveal-inner">
              <div className="pr-expanded-content">
                <div className="pr-reference">
                  <a href={pr.pr_url} target="_blank" rel="noreferrer"><Icon name="merge" /> View merged PR #{pr.pr_number} ↗</a>
                  {pr.impact && <span className="impact">{pr.impact} impact</span>}
                </div>
          <div className="pr-subline">
            <span className="pr-merged-date"><Icon name="calendar" /> Merged {formatDate(pr.merged_at)}</span>
            {pr.language && <span className="pr-language"><Icon name="code" /> {pr.language}</span>}
            <span>
              <Icon name="file" /> {pr.files_changed} file{pr.files_changed === 1 ? '' : 's'}
            </span>
            <span className="diff-add">+{formatFullNumber(pr.additions)} added</span>
            <span className="diff-del">−{formatFullNumber(pr.deletions)} removed</span>
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
            <div className="markdown-content" dangerouslySetInnerHTML={renderMarkdown(pr.pr_body)} />
          )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
