import { describe, expect, it } from '@jest/globals';
import { isTopRankedPackage, PACKAGE_STATUS_OPTIONS } from './ranking';

describe('ranking helpers', () => {
  it('marks only top three ranked packages when sorted by packageRank', () => {
    expect(isTopRankedPackage('packageRank', 0, 5)).toBe(true);
    expect(isTopRankedPackage('packageRank', 2, 1)).toBe(true);
    expect(isTopRankedPackage('packageRank', 3, 10)).toBe(false);
    expect(isTopRankedPackage('createdAt', 0, 5)).toBe(false);
  });

  it('exposes backend-aligned package status filter options', () => {
    expect(PACKAGE_STATUS_OPTIONS).toEqual([
      { value: '', label: 'Any Status' },
      { value: 'ACTIVE', label: 'Active' },
      { value: 'INACTIVE', label: 'Inactive' },
    ]);
  });
});
