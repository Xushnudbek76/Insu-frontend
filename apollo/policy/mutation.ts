import { gql } from '@apollo/client';

export const PURCHASE_POLICY = gql`
  mutation PurchasePolicy($input: PurchasePolicyInput!) {
    purchasePolicy(input: $input) {
      _id
      policyStatus
      packageId
      packageName
      premiumAmount
      startDate
      endDate
    }
  }
`;

export const CANCEL_POLICY = gql`
  mutation CancelPolicy($policyId: String!) {
    cancelPolicy(policyId: $policyId) {
      _id
      policyStatus
      cancelledAt
      updatedAt
    }
  }
`;
