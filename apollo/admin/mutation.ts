import { gql } from '@apollo/client';
import {
  ADMIN_ARTICLE_FIELDS,
  ADMIN_CLAIM_FIELDS,
  ADMIN_MEMBER_FIELDS,
  ADMIN_PACKAGE_FIELDS,
  ADMIN_POLICY_FIELDS,
} from './query';

export const UPDATE_MEMBER_BY_ADMIN = gql`
  ${ADMIN_MEMBER_FIELDS}
  mutation UpdateMemberByAdmin($input: MemberUpdate!) {
    updateMemberByAdmin(input: $input) {
      ...AdminMemberFields
    }
  }
`;

export const UPDATE_PACKAGE_BY_ADMIN = gql`
  ${ADMIN_PACKAGE_FIELDS}
  mutation UpdatePackageByAdmin($input: PackageUpdate!) {
    updatePackageByAdmin(input: $input) {
      ...AdminPackageFields
    }
  }
`;

export const REMOVE_PACKAGE_BY_ADMIN = gql`
  mutation RemovePackageByAdmin($packageId: String!) {
    removePackageByAdmin(packageId: $packageId) {
      _id
      packageStatus
      updatedAt
    }
  }
`;

export const CANCEL_POLICY_BY_ADMIN = gql`
  ${ADMIN_POLICY_FIELDS}
  mutation CancelPolicyByAdmin($policyId: String!) {
    cancelPolicy(policyId: $policyId) {
      ...AdminPolicyFields
    }
  }
`;

export const UPDATE_CLAIM_STATUS_BY_ADMIN = gql`
  ${ADMIN_CLAIM_FIELDS}
  mutation UpdateClaimStatusByAdmin($input: UpdateClaimStatusInput!) {
    updateClaimStatus(input: $input) {
      ...AdminClaimFields
    }
  }
`;

export const UPDATE_BOARD_ARTICLE_BY_ADMIN = gql`
  ${ADMIN_ARTICLE_FIELDS}
  mutation UpdateBoardArticleByAdmin($input: BoardArticleUpdate!) {
    updateBoardArticleByAdmin(input: $input) {
      ...AdminArticleFields
    }
  }
`;

export const REMOVE_BOARD_ARTICLE_BY_ADMIN = gql`
  mutation RemoveBoardArticleByAdmin($articleId: String!) {
    removeBoardArticleByAdmin(articleId: $articleId) {
      _id
      articleStatus
      updatedAt
    }
  }
`;

export const REMOVE_COMMENT_BY_ADMIN = gql`
  mutation RemoveCommentByAdmin($commentId: String!) {
    removeCommentByAdmin(commentId: $commentId) {
      _id
      commentStatus
      updatedAt
    }
  }
`;
