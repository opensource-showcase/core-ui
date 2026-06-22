/**
 * A call-to-action banner shown at the bottom of the page,
 * inviting visitors to create their own .opensource portfolio.
 */

import { useState } from 'react';
import { Icon } from './Icon.tsx';

const COMMAND = 'npx opensource-showcase';

export function BuildYoursBanner() {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(COMMAND).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <aside className="build-yours-banner" aria-label="Create your own portfolio">
      <div className="build-yours-inner">
        <div className="build-yours-copy">
          <span className="build-yours-eyebrow">Open source</span>
          <h2 className="build-yours-heading">Want a portfolio like this?</h2>
          <p className="build-yours-desc">
            Run one command in your terminal. It fetches your merged PRs, helps you curate
            the best ones, and publishes your own{' '}
            <code className="build-yours-code">.opensource</code> portfolio — for free.
          </p>
        </div>

        <div className="build-yours-actions">
          <div className="build-yours-command" aria-label="Terminal command">
            <span className="build-yours-prompt" aria-hidden="true">$</span>
            <code>{COMMAND}</code>
            <button
              type="button"
              className="copy-btn"
              onClick={handleCopy}
              aria-label={copied ? 'Copied!' : 'Copy command'}
            >
              <Icon name={copied ? 'check' : 'copy'} />
              <span className="copy-btn-label">{copied ? 'Copied!' : 'Copy'}</span>
            </button>
          </div>
          <a
            href="https://www.npmjs.com/package/opensource-showcase"
            target="_blank"
            rel="noreferrer"
            className="build-yours-cta"
          >
            Get started →
          </a>
        </div>
      </div>
    </aside>
  );
}
