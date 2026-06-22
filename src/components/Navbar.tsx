import type { Contributor } from '../types.ts';

interface NavbarProps {
  contributor: Contributor;
  darkMode: boolean;
  onToggleDarkMode: () => void;
}

export function Navbar({ contributor, darkMode, onToggleDarkMode }: NavbarProps) {
  const displayName = contributor.name || contributor.username;

  return (
    <header className="sticky top-0 z-50 backdrop-blur-md bg-white/70 dark:bg-slate-950/70 border-b border-slate-200 dark:border-slate-800">
      <div className="max-w-6xl mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img
            src={`https://github.com/${contributor.username}.png`}
            alt={displayName}
            className="h-10 w-10 rounded-full border border-slate-200 dark:border-slate-800"
          />
          <div>
            <p className="text-md font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-100">
              {displayName}
            </p>
            <a
              href={contributor.profile_url}
              target="_blank"
              rel="noreferrer"
              className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline"
            >
              @{contributor.username}
            </a>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={onToggleDarkMode}
            className="p-2 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all cursor-pointer"
            aria-label="Toggle theme"
          >
            {darkMode ? (
              <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364-6.364l-.707.707M6.343 17.657l-.707.707m12.728 0l-.707-.707M6.343 6.343l-.707-.707" />
              </svg>
            ) : (
              <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
              </svg>
            )}
          </button>

          <a
            href="https://github.com/opensource-showcase/opensource-showcase"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          >
            Get CLI Tool
          </a>
        </div>
      </div>
    </header>
  );
}
