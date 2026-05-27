import { gql } from '@apollo/client';
import { NOTICE_FIELDS } from './query';

export const CREATE_NOTICE_BY_ADMIN = gql`
  ${NOTICE_FIELDS}
  mutation CreateNoticeByAdmin($input: NoticeInput!) {
    createNoticeByAdmin(input: $input) {
      ...NoticeFields
    }
  }
`;

export const UPDATE_NOTICE_BY_ADMIN = gql`
  ${NOTICE_FIELDS}
  mutation UpdateNoticeByAdmin($input: NoticeUpdate!) {
    updateNoticeByAdmin(input: $input) {
      ...NoticeFields
    }
  }
`;

export const REMOVE_NOTICE_BY_ADMIN = gql`
  mutation RemoveNoticeByAdmin($noticeId: String!) {
    removeNoticeByAdmin(noticeId: $noticeId) {
      _id
      noticeStatus
      updatedAt
    }
  }
`;
