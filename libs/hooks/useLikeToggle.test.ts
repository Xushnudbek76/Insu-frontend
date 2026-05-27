import { describe, expect, it } from '@jest/globals';
import {
  getMeLiked,
  getNextLikeState,
  normalizeLikeError,
  resolveLikeState,
  toLikeCount,
} from './useLikeToggle';

describe('like toggle helpers', () => {
  it('reads the current favorite marker from meLiked safely', () => {
    expect(getMeLiked([{ myFavorite: true }])).toBe(true);
    expect(getMeLiked([{ myFavorite: false }])).toBe(false);
    expect(getMeLiked([])).toBe(false);
    expect(getMeLiked(null)).toBe(false);
  });

  it('computes optimistic liked and count state without going negative', () => {
    expect(getNextLikeState({ liked: false, count: 4 })).toEqual({
      liked: true,
      count: 5,
    });
    expect(getNextLikeState({ liked: true, count: 4 })).toEqual({
      liked: false,
      count: 3,
    });
    expect(getNextLikeState({ liked: true, count: 0 })).toEqual({
      liked: false,
      count: 0,
    });
  });

  it('normalizes GraphQL and ordinary errors with a fallback', () => {
    expect(
      normalizeLikeError({
        graphQLErrors: [{ message: 'Definer: Not allowed' }],
      }),
    ).toBe('Not allowed');
    expect(normalizeLikeError(new Error('Network failed'))).toBe(
      'Network failed',
    );
    expect(normalizeLikeError({}, 'Try again later.')).toBe('Try again later.');
  });

  it('reconciles optimistic state with optional server fields', () => {
    const optimistic = { liked: true, count: 3 };
    const previous = { liked: false, count: 2 };

    expect(
      resolveLikeState(
        { meLiked: [{ myFavorite: false }], packageLikes: -1 },
        optimistic,
        previous,
        {
          getServerLiked: (result) => result.meLiked[0].myFavorite,
          getServerCount: (result) => result.packageLikes,
        },
      ),
    ).toEqual({ liked: false, count: 0 });

    expect(resolveLikeState(null, optimistic, previous, {})).toEqual(
      optimistic,
    );
    expect(toLikeCount(null)).toBe(0);
  });
});
