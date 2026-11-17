import { Icon } from './Icon.tsx';

interface NavbarProps {
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Navbar({ darkMode, onToggleDarkMode }: NavbarProps) {
  const label = `Switch to ${darkMode ? 'Cream' : 'Classic'} paper`;
  return (
    <header className="topbar-shell">
      <nav className="topbar" aria-label="Paper theme">
        <button className="icon-button theme-toggle" type="button" onClick={onToggleDarkMode}
          aria-label={label} title={label}>
          <Icon name={darkMode ? 'sun' : 'moon'} />
        </button>
      </nav>
    </header>
  );
}
