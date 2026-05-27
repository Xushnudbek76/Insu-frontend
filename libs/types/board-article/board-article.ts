import type { MemberSummary } from '@/libs/types/member/member';

export interface BoardArticle {
  _id: string;
  articleCategory?: string | null;
  articleStatus?: string | null;
  articleTitle?: string | null;
  articleContent?: string | null;
  articleImage?: string | null;
  articleViews?: number | null;
  articleLikes?: number | null;
  articleComments?: number | null;
  memberId?: string | null;
  memberData?: Pick<MemberSummary, '_id' | 'memberNick' | 'memberImage'> | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
