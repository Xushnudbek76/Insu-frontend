import { useCallback, useEffect, useRef, useState } from 'react';
import type { LikeMapOptions, LikeState, SingleLikeOptions } from '@/libs/types/common';

export const getMeLiked = (
  meLiked?: { myFavorite?: boolean }[],
) =>
  meLiked?.[0]?.myFavorite === true;

export const getNextLikeState = (state: LikeState): LikeState => ({
  liked: !state.liked,
  count: state.count + (!state.liked ? 1 : -1),
});

const getLikeErrorMessage = (error: unknown, fallback: string) => {
  return error instanceof Error ? error.message : fallback;
};

export const useSingleLikeToggle = ({
  sourceState,
  isAuthenticated,
  onUnauthenticated,
  mutate,
  onError,
  errorMessage,
}: SingleLikeOptions) => {
  const pendingRef = useRef(false);
  const [isPending, setIsPending] = useState(false);
  const [state, setState] = useState<LikeState>(sourceState);

  useEffect(() => {
    if (pendingRef.current) return;
    setState(sourceState);
  }, [sourceState.liked, sourceState.count]);

  const toggle = useCallback(async () => {
    if (pendingRef.current) return;

    if (!isAuthenticated()) {
      await onUnauthenticated();
      return;
    }

    const previous = state;
    const optimistic = getNextLikeState(previous);

    pendingRef.current = true;
    setIsPending(true);
    // Show the next like state immediately before the backend responds.
    setState(optimistic);

    try {
      const result = await mutate(optimistic, previous);
      // Confirm with backend data.
      setState(result);
    } catch (error) {
      // If the request fails, restore the state from before the click.
      setState(previous);
      await onError(getLikeErrorMessage(error, errorMessage), error);
    } finally {
      pendingRef.current = false;
      setIsPending(false);
    }
  }, [
    sourceState,
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

export const useLikeToggleMap = ({
  sourceStates,
  isAuthenticated,
  onUnauthenticated,
  mutate,
  onError,
  errorMessage,
}: LikeMapOptions) => {
  const pendingIdsRef = useRef<Set<string>>(new Set());
  const [states, setStates] = useState<Record<string, LikeState>>({});
  const [pendingIds, setPendingIds] = useState<Record<string, boolean>>({});

  useEffect(() => {
    setStates((prev) => {
      const next = { ...sourceStates };

      pendingIdsRef.current.forEach((id) => {
        if (prev[id]) next[id] = prev[id];
      });

      return next;
    });
  }, [sourceStates]);

  const getState = useCallback(
    (id: string) => states[id] ?? sourceStates[id] ?? { liked: false, count: 0 },
    [sourceStates, states],
  );

  const toggle = useCallback(
    async (id: string) => {
      if (!id || pendingIdsRef.current.has(id) || !(id in sourceStates)) return;

      if (!isAuthenticated()) {
        await onUnauthenticated();
        return;
      }

      const previous = getState(id);
      const optimistic = getNextLikeState(previous);

      pendingIdsRef.current.add(id);
      setPendingIds((prev) => ({ ...prev, [id]: true }));
      // Show the next like state immediately before the backend responds.
      setStates((prev) => ({ ...prev, [id]: optimistic }));

      try {
        const result = await mutate(id, optimistic, previous);
        // Confirm with backend data.
        setStates((prev) => ({
          ...prev,
          [id]: result,
        }));
      } catch (error) {
        // If the request fails, restore the state from before the click.
        setStates((prev) => ({ ...prev, [id]: previous }));
        await onError(getLikeErrorMessage(error, errorMessage), error);
      } finally {
        pendingIdsRef.current.delete(id);
        setPendingIds(({ [id]: _removed, ...rest }) => rest);
      }
    },
    [
      sourceStates,
      isAuthenticated,
      onUnauthenticated,
      mutate,
      onError,
      errorMessage,
      getState,
    ],
  );

  return {
    getState,
    toggle,
    isPending: (id: string) => pendingIds[id] === true,
  };
};