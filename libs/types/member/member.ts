import type { MeLiked } from '@/libs/types/common';

export interface MemberSummary {
  _id: string;
  memberType?: string | null;
  memberStatus?: string | null;
  memberAuthType?: string | null;
  memberPhone?: string | null;
  memberNick?: string | null;
  memberFullName?: string | null;
  memberImage?: string | null;
  memberAddress?: string | null;
  memberDesc?: string | null;
  memberProperties?: number | null;
  memberRank?: number | null;
  memberArticles?: number | null;
  memberPoints?: number | null;
  memberLikes?: number | null;
  memberFollowers?: number | null;
  memberFollowings?: number | null;
  memberViews?: number | null;
  memberComments?: number | null;
  memberWarnings?: number | null;
  memberBlocks?: number | null;
  meLiked?: MeLiked[] | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
