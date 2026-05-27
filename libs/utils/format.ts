import type { MetaCounter } from '@/libs/types/common';

export const formatCount = (value?: number | null) =>
  value == null ? '0' : value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);

export const getTotal = (metaCounter?: MetaCounter | MetaCounter[] | null) =>
  Array.isArray(metaCounter) ? metaCounter[0]?.total ?? 0 : metaCounter?.total ?? 0;
