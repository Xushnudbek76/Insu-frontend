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
