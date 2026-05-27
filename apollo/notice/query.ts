import { gql } from '@apollo/client';

export const NOTICE_FIELDS = gql`
  fragment NoticeFields on Notice {
    _id
    noticeCategory
    noticeStatus
    noticeTitle
    noticeContent
    memberId
    createdAt
    updatedAt
  }
`;

export const GET_NOTICES = gql`
  ${NOTICE_FIELDS}
  query GetNotices($input: NoticesInquiry!) {
    getNotices(input: $input) {
      list {
        ...NoticeFields
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_ALL_NOTICES_BY_ADMIN = gql`
  ${NOTICE_FIELDS}
  query GetAllNoticesByAdmin($input: AllNoticesInquiry!) {
    getAllNoticesByAdmin(input: $input) {
      list {
        ...NoticeFields
      }
      metaCounter {
        total
      }
    }
  }
`;
