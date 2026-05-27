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
