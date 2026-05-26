export const PACKAGE_STATUS_OPTIONS = [
  { value: '', label: 'Any Status' },
  { value: 'ACTIVE', label: 'Active' },
  { value: 'INACTIVE', label: 'Inactive' },
] as const;

export const isTopRankedPackage = (
  sort: string,
  index: number,
  packageRank?: number | null,
) => sort === 'packageRank' && index < 3 && (packageRank ?? 0) > 0;
