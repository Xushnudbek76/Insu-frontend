import { describe, expect, it } from '@jest/globals';
import {
  getMeLiked,
  getNextLikeState,
} from './useLikeToggle';

describe('like toggle helpers', () => {
  it('reads the current favorite marker from meLiked safely', () => {
    expect(getMeLiked([{ myFavorite: true }])).toBe(true);
    expect(getMeLiked([{ myFavorite: false }])).toBe(false);
    expect(getMeLiked([])).toBe(false);
    expect(getMeLiked(null)).toBe(false);
  });

  it('computes optimistic liked and count state', () => {
    expect(getNextLikeState({ liked: false, count: 4 })).toEqual({
      liked: true,
      count: 5,
    });
    expect(getNextLikeState({ liked: true, count: 4 })).toEqual({
      liked: false,
      count: 3,
    });
  });
});
