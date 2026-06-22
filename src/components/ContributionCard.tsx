import { useState } from 'react';
import type { EnrichedContribution } from '../types.ts';
import { renderMarkdown } from '../utils/markdown.ts';

interface ContributionCardProps {
  contribution: EnrichedContribution;
}

function MergeIcon() {
  return (
    <svg className="h-4 w-4 fill-current text-purple-600 dark:text-purple-400 shrink-0" viewBox="0 0 16 16">
      <path d="M5 3.25a2.25 2.25 0 1 1-2.75-2.193v9.886A2.25 2.25 0 1 1 .75 13V3.057A2.25 2.25 0 1 1 5 3.25Zm-2.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Zm0 9.5a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5ZM14.75 3.25a2.25 2.25 0 0 1-3 2.122v.878A3.75 3.75 0 0 1 8 10H6.75a.75.75 0 0 1 0-1.5H8a2.25 2.25 0 0 0 2.25-2.25v-.878a2.25 2.25 0 1 1 4.5-2.122Zm-2.25-.75a.75.75 0 1 0 0 1.5.75.75 0 0 0 0-1.5Z" />
    </svg>
  );
}

const IMPACT_STYLES: Record<string, string> = {
  high: 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-700 dark:text-rose-400',
  medium: 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/50 text-amber-700 dark:text-amber-400',
  low: 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-700 dark:text-emerald-400',
};

export function ContributionCard({ contribution: pr }: ContributionCardProps) {
  const [expanded, setExpanded] = useState(false);

  const dateString = new Date(pr.merged_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  const hasDescription = Boolean(pr.pr_body?.trim());
  const reviewers = pr.reviewers?.slice(0, 5) ?? [];

  return (
    <article className="p-6 transition hover:bg-slate-50/20 dark:hover:bg-slate-900/20">
      {/* PR Heading */}
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1 min-w-0">
          <div className="flex items-center flex-wrap gap-2">
            <MergeIcon />
            <a
              href={pr.pr_url}
              target="_blank"
              rel="noreferrer"
              className="font-bold text-[15px] text-indigo-600 dark:text-indigo-400 hover:underline truncate"
            >
              {pr.pr_title}
            </a>
            <span className="text-slate-400 dark:text-slate-500 font-medium text-sm shrink-0">
              #{pr.pr_number}
            </span>
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">Merged on {dateString}</div>
        </div>

        {pr.impact && (
          <span
            className={`text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border shrink-0 ${IMPACT_STYLES[pr.impact] ?? ''}`}
          >
            {pr.impact} impact
          </span>
        )}
      </div>

      {/* Personal Impact Note */}
      {pr.note && (
        <div className="mt-3 bg-amber-500/10 border-l-4 border-amber-500 p-3 rounded-r-lg text-xs leading-relaxed text-slate-700 dark:text-slate-300">
          <span className="font-bold text-amber-700 dark:text-amber-400">Impact: </span>
          {pr.note}
        </div>
      )}

      {/* Diff Stats & Reviewer Row */}
      <div className="flex flex-wrap gap-y-2 gap-x-6 text-xs text-slate-500 dark:text-slate-400 mt-4 items-center">
        {pr.language && (
          <div className="flex items-center gap-1.5">
            <span className="h-2.5 w-2.5 rounded-full bg-slate-300 dark:bg-slate-600" />
            <span>{pr.language}</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <span className="font-semibold text-emerald-600 dark:text-emerald-500 font-mono">
            +{pr.additions.toLocaleString()}
          </span>
          <span className="font-semibold text-rose-600 dark:text-rose-500 font-mono">
            -{pr.deletions.toLocaleString()}
          </span>
          <span className="text-slate-300 dark:text-slate-600">|</span>
          <span>
            {pr.files_changed} file{pr.files_changed === 1 ? '' : 's'}
          </span>
        </div>

        {reviewers.length > 0 ? (
          <div className="flex items-center gap-2">
            <span className="text-slate-400">Approved by:</span>
            <div className="flex -space-x-1.5">
              {reviewers.map((reviewer) => (
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

      {/* Labels */}
      {pr.labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-3">
          {pr.labels.map((lbl) => (
            <span
              key={lbl}
              className="text-[10px] font-semibold px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-200/50 dark:border-slate-700/50"
            >
              {lbl}
            </span>
          ))}
        </div>
      )}

      {/* Markdown Description Accordion */}
      {hasDescription && (
        <div className="mt-4">
          <button
            onClick={() => setExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 cursor-pointer"
          >
            {expanded ? 'Collapse description ▲' : 'Show description ▼'}
          </button>

          {expanded && (
            <div className="mt-3 text-xs bg-slate-50/50 dark:bg-slate-950/40 border border-slate-200/60 dark:border-slate-800/80 p-4 rounded-xl prose prose-slate dark:prose-invert max-w-none">
              <div dangerouslySetInnerHTML={renderMarkdown(pr.pr_body)} />
            </div>
          )}
        </div>
      )}
    </article>
  );
}
