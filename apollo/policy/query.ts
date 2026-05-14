import { gql } from '@apollo/client';

export const GET_MY_POLICIES = gql`
  query GetMyPolicies($input: MyPoliciesInquiry!) {
    getMyPolicies(input: $input) {
      list {
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
      metaCounter {
        total
      }
    }
  }
`;
