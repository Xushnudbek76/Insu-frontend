export interface Notice {
  _id: string;
  noticeCategory?: string | null;
  noticeStatus?: string | null;
  noticeTitle?: string | null;
  noticeContent?: string | null;
  memberId?: string | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}
