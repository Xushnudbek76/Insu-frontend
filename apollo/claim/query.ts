import { gql } from '@apollo/client';

export const CLAIM_FIELDS = gql`
  fragment ClaimFields on Claim {
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

export const GET_MY_CLAIMS = gql`
  ${CLAIM_FIELDS}
  query GetMyClaims {
    getMyClaims {
      ...ClaimFields
    }
  }
`;

export const GET_CLAIMS_BY_AGENT = gql`
  ${CLAIM_FIELDS}
  query GetClaimsByAgent($input: AgentClaimsInquiry!) {
    getClaimsByAgent(input: $input) {
      list {
        ...ClaimFields
      }
      metaCounter {
        total
      }
    }
  }
`;
