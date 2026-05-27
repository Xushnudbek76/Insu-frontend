import { PACKAGE_STATUS_OPTIONS } from '@/libs/utils/ranking';

export interface PackageSelectOption {
  value: string;
  label: string;
}

export const PACKAGE_TYPE_OPTIONS: PackageSelectOption[] = [
  { value: '', label: 'All Types' },
  { value: 'HEALTH', label: 'Health' },
  { value: 'AUTO', label: 'Auto' },
  { value: 'HOME', label: 'Home' },
  { value: 'TRAVEL', label: 'Travel' },
];

export const PACKAGE_STATUS_FILTER_OPTIONS: PackageSelectOption[] = [...PACKAGE_STATUS_OPTIONS];

export const PACKAGE_COVERAGE_OPTIONS: PackageSelectOption[] = [
  { value: '', label: 'Any' },
  { value: '100000', label: '$100k+' },
  { value: '250000', label: '$250k+' },
  { value: '500000', label: '$500k+' },
  { value: '1000000', label: '$1M+' },
];

export const PACKAGE_SORT_OPTIONS: PackageSelectOption[] = [
  { value: 'createdAt', label: 'Newest' },
  { value: 'packageViews', label: 'Most Viewed' },
  { value: 'packageLikes', label: 'Most Liked' },
  { value: 'packagePrice', label: 'Price' },
  { value: 'packageRank', label: 'Top Ranked' },
];
