type IconName =
  | 'moon'
  | 'sun'
  | 'search'
  | 'github'
  | 'external'
  | 'branch'
  | 'chevron'
  | 'chevron-down'
  | 'sort'
  | 'check'
  | 'x'
  | 'copy';

const paths: Record<IconName, string> = {
  moon: 'M21 12.8A8.5 8.5 0 1 1 11.2 3a6.5 6.5 0 0 0 9.8 9.8Z',
  sun: 'M12 4V2m0 20v-2m8-8h2M2 12h2m14.9-6.9 1.4-1.4M3.7 20.3l1.4-1.4m0-13.8L3.7 3.7m16.6 16.6-1.4-1.4M12 17a5 5 0 1 0 0-10 5 5 0 0 0 0 10Z',
  search: 'm21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z',
  github:
    'M12 2.2a9.8 9.8 0 0 0-3.1 19.1c.5.1.7-.2.7-.5v-1.7c-2.8.6-3.4-1.2-3.4-1.2-.5-1.1-1.1-1.4-1.1-1.4-.9-.6.1-.6.1-.6 1 .1 1.6 1.1 1.6 1.1.9 1.5 2.4 1.1 2.9.8.1-.7.4-1.1.7-1.4-2.2-.3-4.6-1.1-4.6-4.9 0-1.1.4-2 1.1-2.7-.1-.3-.5-1.3.1-2.7 0 0 .9-.3 2.8 1.1a9.8 9.8 0 0 1 5.2 0c2-1.4 2.8-1.1 2.8-1.1.6 1.4.2 2.4.1 2.7.7.7 1.1 1.6 1.1 2.7 0 3.8-2.3 4.6-4.6 4.9.4.3.8 1 .8 2v2.4c0 .3.2.6.7.5A9.8 9.8 0 0 0 12 2.2Z',
  external: 'M14 3h7v7m-1-6-9 9m-4-7H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h11a2 2 0 0 0 2-2v-4',
  branch:
    'M7 16.18v-5.23A6.88 6.88 0 0 0 11.89 13h3.29c.41 1.16 1.51 2 2.82 2 1.65 0 3-1.35 3-3s-1.35-3-3-3c-1.3 0-2.4.84-2.82 2h-3.29c-2.14 0-3.94-1.39-4.61-3.3A2.99 2.99 0 0 0 8.99 5c0-1.65-1.35-3-3-3s-3 1.35-3 3c0 1.3.84 2.4 2 2.82v8.37c-1.16.41-2 1.51-2 2.82 0 1.65 1.35 3 3 3s3-1.35 3-3c0-1.3-.84-2.4-2-2.82ZM18 11c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1M6 4c.55 0 1 .45 1 1s-.45 1-1 1-1-.45-1-1 .45-1 1-1m0 16c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1',
  chevron: 'm6 9 6 6 6-6',
  'chevron-down': 'm6 9 6 6 6-6',
  sort: 'M3 6h18M7 12h10M11 18h2',
  check: 'M20 6 9 17l-5-5',
  x: 'M18 6 6 18M6 6l12 12',
  copy: 'M8 4H6a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2M16 4h2a2 2 0 0 1 2 2v10a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2v-2',
};

const fillIcons = new Set<IconName>(['branch']);

export function Icon({ name }: { name: IconName }) {
  return (
    <svg
      aria-hidden="true"
      className="icon"
      fill={fillIcons.has(name) ? 'currentColor' : 'none'}
      stroke={fillIcons.has(name) ? 'none' : 'currentColor'}
      strokeLinecap="round"
      strokeLinejoin="round"
      strokeWidth="2"
      viewBox="0 0 24 24"
    >
      <path d={paths[name]} />
    </svg>
  );
}
