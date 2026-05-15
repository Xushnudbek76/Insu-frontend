import { toAssetUrl } from '@/libs/api';

export const getPackageImage = (images?: string[] | null) =>
  toAssetUrl(images?.[0]) ?? '/img/placeholder-article.svg';

export const getMemberImage = (image?: string | null) => toAssetUrl(image);

export const formatCoverage = (n?: number | null) => {
  if (n == null) return '—';
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`;
  return `$${n}`;
};

export const typeLabel = (t: string) =>
  ({
    AUTO: 'Car Insurance',
    HOME: 'Home Insurance',
    HEALTH: 'Health Insurance',
    TRAVEL: 'Travel Insurance',
  })[t] ?? t;

export const timeAgo = (dateStr: string) => {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days} day${days !== 1 ? 's' : ''} ago`;
};
