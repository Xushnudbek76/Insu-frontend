import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

type MaybePromise<T> = T | Promise<T>;

export interface LikeState {
  liked: boolean;
  count: number;
}

export interface FavoriteMarker {
  myFavorite?: boolean | null;
}

interface LikeResponseResolvers<TResult> {
  getServerLiked?: (
    result: TResult,
    optimistic: LikeState,
    previous: LikeState,
  ) => boolean | null | undefined;
  getServerCount?: (
    result: TResult,
    optimistic: LikeState,
    previous: LikeState,
  ) => number | null | undefined;
}

interface LikeGuardOptions {
  isAuthenticated: () => boolean;
  onUnauthenticated: () => MaybePromise<void>;
  onError: (message: string, error: unknown) => MaybePromise<void>;
  errorMessage: string;
}

interface UseSingleLikeToggleOptions<TSource, TResult>
  extends LikeGuardOptions,
    LikeResponseResolvers<TResult> {
  source?: TSource | null;
  getSourceLiked: (source: TSource) => boolean;
  getSourceCount: (source: TSource) => number | null | undefined;
  mutate: (
    optimistic: LikeState,
    previous: LikeState,
    source: TSource,
  ) => Promise<TResult | null | undefined>;
}

interface UseLikeToggleMapOptions<TItem, TResult>
  extends LikeGuardOptions,
    LikeResponseResolvers<TResult> {
  items: TItem[];
  getId: (item: TItem) => string;
  getItemLiked: (item: TItem) => boolean;
  getItemCount: (item: TItem) => number | null | undefined;
  mutate: (
    id: string,
    optimistic: LikeState,
    previous: LikeState,
    item: TItem | undefined,
  ) => Promise<TResult | null | undefined>;
}

export const toLikeCount = (count?: number | null) =>
  Math.max(0, count ?? 0);

export const getMeLiked = (meLiked?: FavoriteMarker[] | null) =>
  meLiked?.[0]?.myFavorite === true;

export const getNextLikeState = (state: LikeState): LikeState => ({
  liked: !state.liked,
  count: toLikeCount(state.count + (!state.liked ? 1 : -1)),
});

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

export const resolveLikeState = <TResult>(
  result: TResult | null | undefined,
  optimistic: LikeState,
  previous: LikeState,
  resolvers: LikeResponseResolvers<TResult>,
): LikeState => {
  if (!result) return optimistic;

  const serverLiked = resolvers.getServerLiked?.(
    result,
    optimistic,
    previous,
  );
  const serverCount = resolvers.getServerCount?.(
    result,
    optimistic,
    previous,
  );

  return {
    liked: typeof serverLiked === 'boolean' ? serverLiked : optimistic.liked,
    count: typeof serverCount === 'number' ? toLikeCount(serverCount) : optimistic.count,
  };
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

export const useSingleLikeToggle = <TSource, TResult>({
  source,
  getSourceLiked,
  getSourceCount,
  isAuthenticated,
  onUnauthenticated,
  mutate,
  getServerLiked,
  getServerCount,
  onError,
  errorMessage,
}: UseSingleLikeToggleOptions<TSource, TResult>) => {
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
      setState(
        resolveLikeState(result, optimistic, previous, {
          getServerLiked,
          getServerCount,
        }),
      );
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
    getServerLiked,
    getServerCount,
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

export const useLikeToggleMap = <TItem, TResult>({
  items,
  getId,
  getItemLiked,
  getItemCount,
  isAuthenticated,
  onUnauthenticated,
  mutate,
  getServerLiked,
  getServerCount,
  onError,
  errorMessage,
}: UseLikeToggleMapOptions<TItem, TResult>) => {
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
          [id]: resolveLikeState(result, optimistic, previous, {
            getServerLiked,
            getServerCount,
          }),
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
      getServerLiked,
      getServerCount,
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
