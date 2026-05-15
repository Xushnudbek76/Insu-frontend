export const formatCount = (value?: number | null) =>
  value == null ? '0' : value >= 1000 ? `${(value / 1000).toFixed(1)}k` : String(value);

export const getTotal = (metaCounter: any) => metaCounter?.total ?? metaCounter?.[0]?.total ?? 0;
