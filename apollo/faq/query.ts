import { gql } from '@apollo/client';

export const FAQ_FIELDS = gql`
  fragment FaqFields on Faq {
    _id
    faqCategory
    faqStatus
    faqQuestion
    faqAnswer
    faqOrder
    memberId
    createdAt
    updatedAt
  }
`;

export const GET_FAQS = gql`
  ${FAQ_FIELDS}
  query GetFaqs($input: FaqsInquiry!) {
    getFaqs(input: $input) {
      list {
        ...FaqFields
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_ALL_FAQS_BY_ADMIN = gql`
  ${FAQ_FIELDS}
  query GetAllFaqsByAdmin($input: AllFaqsInquiry!) {
    getAllFaqsByAdmin(input: $input) {
      list {
        ...FaqFields
      }
      metaCounter {
        total
      }
    }
  }
`;
