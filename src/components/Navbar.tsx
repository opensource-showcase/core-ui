import type { Contributor } from '../types.ts';
import { Icon } from './Icon.tsx';

interface NavbarProps {
  contributor: Contributor;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Navbar({ contributor, darkMode, onToggleDarkMode }: NavbarProps) {
  const displayName = contributor.name || contributor.username;

  return (
    <header className="topbar">
      <a className="identity" href={contributor.profile_url} target="_blank" rel="noreferrer">
        <img src={`https://github.com/${contributor.username}.png`} alt={displayName} />
        <span>
          <strong>{displayName}</strong>
          <small>@{contributor.username}</small>
        </span>
      </a>

      <nav className="top-actions" aria-label="Portfolio actions">
        <a className="icon-button" href="https://github.com/opensource-showcase/opensource-showcase" target="_blank" rel="noreferrer" aria-label="Open opensource-showcase on GitHub">
          <Icon name="github" />
        </a>
        <button className="icon-button" type="button" onClick={onToggleDarkMode} aria-label="Toggle theme">
          <Icon name={darkMode ? 'sun' : 'moon'} />
        </button>
      </nav>
    </header>
  );
}
