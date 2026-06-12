export interface MetaCounter {
  total: number;
}

export interface PagedResult<T> {
  list: T[];
  metaCounter?: MetaCounter[];
}

export interface MeLiked {
  memberId?: string | null;
  likeRefId?: string | null;
  myFavorite: boolean;
}

export interface LikeState {
  liked: boolean;
  count: number;
}

export type SingleLikeOptions = {
  sourceState: LikeState;
  isAuthenticated: () => boolean;
  onUnauthenticated: () => Promise<void>;
  mutate: (
    optimistic: LikeState,
    previous: LikeState,
  ) => Promise<LikeState>;
  onError: (message: string, error: unknown) => Promise<void>;
  errorMessage: string;
};

export type LikeMapOptions = {
  sourceStates: Record<string, LikeState>;
  isAuthenticated: () => boolean;
  onUnauthenticated: () => Promise<void>;
  mutate: (
    id: string,
    optimistic: LikeState,
    previous: LikeState,
  ) => Promise<LikeState>;
  onError: (message: string, error: unknown) => Promise<void>;
  errorMessage: string;
};
