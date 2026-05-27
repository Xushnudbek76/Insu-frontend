import { gql } from '@apollo/client';
import { FAQ_FIELDS } from './query';

export const CREATE_FAQ_BY_ADMIN = gql`
  ${FAQ_FIELDS}
  mutation CreateFaqByAdmin($input: FaqInput!) {
    createFaqByAdmin(input: $input) {
      ...FaqFields
    }
  }
`;

export const UPDATE_FAQ_BY_ADMIN = gql`
  ${FAQ_FIELDS}
  mutation UpdateFaqByAdmin($input: FaqUpdate!) {
    updateFaqByAdmin(input: $input) {
      ...FaqFields
    }
  }
`;

export const REMOVE_FAQ_BY_ADMIN = gql`
  mutation RemoveFaqByAdmin($faqId: String!) {
    removeFaqByAdmin(faqId: $faqId) {
      _id
      faqStatus
      updatedAt
    }
  }
`;
