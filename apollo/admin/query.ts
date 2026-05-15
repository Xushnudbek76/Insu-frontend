import { gql } from '@apollo/client';

export const ADMIN_MEMBER_FIELDS = gql`
  fragment AdminMemberFields on Member {
    _id
    memberType
    memberStatus
    memberAuthType
    memberPhone
    memberNick
    memberFullName
    memberImage
    memberAddress
    memberDesc
    memberProperties
    memberRank
    memberArticles
    memberPoints
    memberLikes
    memberViews
    memberComments
    createdAt
    updatedAt
  }
`;

export const ADMIN_PACKAGE_FIELDS = gql`
  fragment AdminPackageFields on Package {
    _id
    packageType
    packageStatus
    packageTitle: packageName
    packageDesc
    packagePrice
    packageCoverageLimit
    packageMinAge
    packageMaxAge
    packageImages
    packageViews
    packageLikes
    packageComments
    memberId
    createdAt
    updatedAt
  }
`;

export const ADMIN_POLICY_FIELDS = gql`
  fragment AdminPolicyFields on Policy {
    _id
    policyStatus
    memberId
    packageId
    memberNick
    packageName
    premiumAmount
    AgentId
    startDate
    endDate
    cancelledAt
    createdAt
    updatedAt
  }
`;

export const ADMIN_CLAIM_FIELDS = gql`
  fragment AdminClaimFields on Claim {
    _id
    claimStatus
    memberId
    policyId
    claimTitle
    claimDesc
    agentId
    claimAmount
    claimDocuments
    aiAnalysis
    agentNote
    createdAt
    updatedAt
  }
`;

export const ADMIN_ARTICLE_FIELDS = gql`
  fragment AdminArticleFields on BoardArticle {
    _id
    articleCategory
    articleStatus
    articleTitle
    articleContent
    articleImage
    articleViews
    articleLikes
    articleComments
    memberId
    createdAt
    updatedAt
    memberData {
      _id
      memberNick
      memberImage
    }
  }
`;

export const ADMIN_COMMENT_FIELDS = gql`
  fragment AdminCommentFields on Comment {
    _id
    commentStatus
    commentGroup
    commentContent
    commentRefId
    memberId
    createdAt
    updatedAt
    memberData {
      _id
      memberNick
      memberImage
    }
  }
`;

export const GET_ALL_MEMBERS_BY_ADMIN = gql`
  ${ADMIN_MEMBER_FIELDS}
  query GetAllMembersByAdmin($input: MembersInquiry!) {
    getAllMembersByAdmin(input: $input) {
      list {
        ...AdminMemberFields
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_ALL_PACKAGES_BY_ADMIN = gql`
  ${ADMIN_PACKAGE_FIELDS}
  query GetAllPackagesByAdmin($input: AllPackagesInquiry!) {
    getAllPackagesByAdmin(input: $input) {
      list {
        ...AdminPackageFields
      }
      metaCounter {
        total
      }
    }
  }
`;

export const ADMIN_GET_ALL_POLICIES = gql`
  ${ADMIN_POLICY_FIELDS}
  query AdminGetAllPolicies($input: AllPoliciesInquiry!) {
    adminGetAllPolicies(input: $input) {
      list {
        ...AdminPolicyFields
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_ALL_CLAIMS_BY_ADMIN = gql`
  ${ADMIN_CLAIM_FIELDS}
  query GetAllClaimsByAdmin($input: AllClaimsInquiry!) {
    getAllClaimsByAdmin(input: $input) {
      list {
        ...AdminClaimFields
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_ALL_BOARD_ARTICLES_BY_ADMIN = gql`
  ${ADMIN_ARTICLE_FIELDS}
  query GetAllBoardArticlesByAdmin($input: AllBoardArticlesInquiry!) {
    getAllBoardArticlesByAdmin(input: $input) {
      list {
        ...AdminArticleFields
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_ADMIN_LATEST_COMMENTS = gql`
  ${ADMIN_COMMENT_FIELDS}
  query GetAdminLatestComments($input: LatestCommentsInquiry!) {
    getLatestComments(input: $input) {
      list {
        ...AdminCommentFields
      }
      metaCounter {
        total
      }
    }
  }
`;
