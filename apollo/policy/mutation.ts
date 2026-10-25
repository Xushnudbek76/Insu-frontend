import { POLICY_OFFER_FIELDS } from './query';
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

export const SEND_POLICY_OFFER = gql`mutation SendPolicyOffer($conversationId:String!,$startDate:DateTime!,$endDate:DateTime!) { sendPolicyOffer(conversationId:$conversationId,startDate:$startDate,endDate:$endDate) { ...PolicyOfferFields } } ${POLICY_OFFER_FIELDS}`;
export const ACCEPT_POLICY_OFFER = gql`mutation AcceptPolicyOffer($policyId:String!) { acceptPolicyOffer(policyId:$policyId) { ...PolicyOfferFields } } ${POLICY_OFFER_FIELDS}`;
export const DECLINE_POLICY_OFFER = gql`mutation DeclinePolicyOffer($policyId:String!) { declinePolicyOffer(policyId:$policyId) { ...PolicyOfferFields } } ${POLICY_OFFER_FIELDS}`;
export const WITHDRAW_POLICY_OFFER = gql`mutation WithdrawPolicyOffer($policyId:String!) { withdrawPolicyOffer(policyId:$policyId) { ...PolicyOfferFields } } ${POLICY_OFFER_FIELDS}`;
export const CONFIRM_POLICY_PAYMENT = gql`mutation ConfirmPolicyPayment($policyId:String!) { confirmPolicyPayment(policyId:$policyId) { ...PolicyOfferFields } } ${POLICY_OFFER_FIELDS}`;
