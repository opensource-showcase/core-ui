export function formatNumber(value: number) {
  return new Intl.NumberFormat('en-US', {
    notation: value >= 10000 ? 'compact' : 'standard',
  }).format(value);
}

export function formatFullNumber(value: number) {
  return new Intl.NumberFormat('en-US').format(value);
}

export function formatDate(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(new Date(value));
}

export function normalizeWebsite(value: string) {
  return value.startsWith('http://') || value.startsWith('https://') ? value : `https://${value}`;
}

export function normalizeTwitter(value: string) {
  return value.replace(/^@/, '');
}
