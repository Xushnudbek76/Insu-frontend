import type { MemberSummary } from '@/libs/types/member/member';

export interface Comment {
  _id: string;
  commentStatus?: string | null;
  commentGroup?: string | null;
  commentContent?: string | null;
  commentRefId?: string | null;
  memberId?: string | null;
  memberData?: Pick<MemberSummary, '_id' | 'memberNick' | 'memberImage'> | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
