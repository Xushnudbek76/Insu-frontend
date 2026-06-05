import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type MaybePromise<T> = T | Promise<T>;

export interface LikeState {
  liked: boolean;
  count: number;
}

export interface FavoriteMarker {
  myFavorite?: boolean | null;
}

interface LikeGuardOptions {
  isAuthenticated: () => boolean;
  onUnauthenticated: () => MaybePromise<void>;
  onError: (message: string, error: unknown) => MaybePromise<void>;
  errorMessage: string;
}

interface UseSingleLikeToggleOptions<TSource> extends LikeGuardOptions {
  source?: TSource | null;
  getSourceLiked: (source: TSource) => boolean;
  getSourceCount: (source: TSource) => number | null | undefined;
  mutate: (
    optimistic: LikeState,
    previous: LikeState,
    source: TSource,
  ) => Promise<LikeState | null | undefined>;
}

interface UseLikeToggleMapOptions<TItem> extends LikeGuardOptions {
  items: TItem[];
  getId: (item: TItem) => string;
  getItemLiked: (item: TItem) => boolean;
  getItemCount: (item: TItem) => number | null | undefined;
  mutate: (
    id: string,
    optimistic: LikeState,
    previous: LikeState,
    item: TItem | undefined,
  ) => Promise<LikeState | null | undefined>;
}

export const toLikeCount = (count?: number | null) =>
  Math.max(0, count ?? 0);

export const getMeLiked = (meLiked?: FavoriteMarker[] | null) =>
  meLiked?.[0]?.myFavorite === true;

export const getNextLikeState = (state: LikeState): LikeState => ({
  liked: !state.liked,
  count: toLikeCount(state.count + (!state.liked ? 1 : -1)),
});

export const normalizeLikeState = (
  state: LikeState | null | undefined,
  fallback: LikeState,
): LikeState =>
  state
    ? {
        liked: state.liked,
        count: toLikeCount(state.count),
      }
    : fallback;

export const normalizeLikeError = (
  error: unknown,
  fallback = 'Could not update likes.',
) => {
  const maybeError = error as {
    graphQLErrors?: { message?: string }[];
    message?: string;
  };
  const rawMessage =
    maybeError?.graphQLErrors?.[0]?.message ?? maybeError?.message ?? fallback;
  const message =
    typeof rawMessage === 'string'
      ? rawMessage.replace(/^Definer:\s*/, '').trim()
      : fallback;

  return message || fallback;
};

const buildSourceState = <TSource>(
  source: TSource,
  getLiked: (source: TSource) => boolean,
  getCount: (source: TSource) => number | null | undefined,
): LikeState => ({
  liked: getLiked(source),
  count: toLikeCount(getCount(source)),
});

const buildFallbackState = (fallback?: Partial<LikeState>): LikeState => ({
  liked: fallback?.liked ?? false,
  count: toLikeCount(fallback?.count),
});

export const useSingleLikeToggle = <TSource>({
  source,
  getSourceLiked,
  getSourceCount,
  isAuthenticated,
  onUnauthenticated,
  mutate,
  onError,
  errorMessage,
}: UseSingleLikeToggleOptions<TSource>) => {
  const pendingRef = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<LikeState>(() =>
    source
      ? buildSourceState(source, getSourceLiked, getSourceCount)
      : buildFallbackState(),
  );

  useEffect(() => {
    if (!source || pendingRef.current) return;
    setState(buildSourceState(source, getSourceLiked, getSourceCount));
  }, [source]);

  const toggle = useCallback(async () => {
    if (!source || pendingRef.current) return;

    if (!isAuthenticated()) {
      await onUnauthenticated();
      return;
    }

    const previous = state;
    const optimistic = getNextLikeState(previous);

    pendingRef.current = true;
    setIsPending(true);
    setState(optimistic);

    try {
      const result = await mutate(optimistic, previous, source);
      setState(normalizeLikeState(result, optimistic));
    } catch (error) {
      setState(previous);
      await onError(normalizeLikeError(error, errorMessage), error);
    } finally {
      pendingRef.current = false;
      setIsPending(false);
    }
  }, [
    source,
    state,
    isAuthenticated,
    onUnauthenticated,
    mutate,
    onError,
    errorMessage,
  ]);

  return {
    liked: state.liked,
    count: state.count,
    isPending,
    toggle,
  };
};

export const useLikeToggleMap = <TItem>({
  items,
  getId,
  getItemLiked,
  getItemCount,
  isAuthenticated,
  onUnauthenticated,
  mutate,
  onError,
  errorMessage,
}: UseLikeToggleMapOptions<TItem>) => {
  const pendingIdsRef = useRef<Set<string>>(new Set());
  const [states, setStates] = useState<Record<string, LikeState>>({});

  useEffect(() => {
    if (!items.length) return;

    setStates((prev) => {
      let changed = false;
      const next = { ...prev };

      items.forEach((item) => {
        const id = getId(item);
        if (!id || pendingIdsRef.current.has(id)) return;

        const sourceState = buildSourceState(item, getItemLiked, getItemCount);
        const existing = next[id];
        if (
          !existing ||
          existing.liked !== sourceState.liked ||
          existing.count !== sourceState.count
        ) {
          next[id] = sourceState;
          changed = true;
        }
      });

      return changed ? next : prev;
    });
  }, [items]);

  const likedById = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(states).map(([id, itemState]) => [id, itemState.liked]),
      ) as Record<string, boolean>,
    [states],
  );

  const countsById = useMemo(
    () =>
      Object.fromEntries(
        Object.entries(states).map(([id, itemState]) => [id, itemState.count]),
      ) as Record<string, number>,
    [states],
  );

  const getState = useCallback(
    (id: string, fallback?: Partial<LikeState>) =>
      states[id] ?? buildFallbackState(fallback),
    [states],
  );

  const toggle = useCallback(
    async (id: string) => {
      if (!id || pendingIdsRef.current.has(id)) return;

      if (!isAuthenticated()) {
        await onUnauthenticated();
        return;
      }

      const item = items.find((candidate) => getId(candidate) === id);
      const previous = getState(id, {
        liked: item ? getItemLiked(item) : false,
        count: item ? getItemCount(item) ?? 0 : 0,
      });
      const optimistic = getNextLikeState(previous);

      pendingIdsRef.current.add(id);
      setStates((prev) => ({ ...prev, [id]: optimistic }));

      try {
        const result = await mutate(id, optimistic, previous, item);
        setStates((prev) => ({
          ...prev,
          [id]: normalizeLikeState(result, optimistic),
        }));
      } catch (error) {
        setStates((prev) => ({ ...prev, [id]: previous }));
        await onError(normalizeLikeError(error, errorMessage), error);
      } finally {
        pendingIdsRef.current.delete(id);
      }
    },
    [
      items,
      getId,
      getItemLiked,
      getItemCount,
      isAuthenticated,
      onUnauthenticated,
      mutate,
      onError,
      errorMessage,
      getState,
    ],
  );

  return {
    states,
    likedById,
    countsById,
    getState,
    toggle,
    isPending: (id: string) => pendingIdsRef.current.has(id),
  };
};
