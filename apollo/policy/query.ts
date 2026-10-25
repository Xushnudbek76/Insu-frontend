import { gql } from '@apollo/client';

export const GET_MY_POLICIES = gql`
  query GetMyPolicies($input: MyPoliciesInquiry!) {
    getMyPolicies(input: $input) {
      list {
        _id
        policyStatus
        conversationId
        purchaseStage
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

export const POLICY_OFFER_FIELDS = gql`fragment PolicyOfferFields on Policy { _id conversationId packageName premiumAmount coverageLimit startDate endDate policyStatus purchaseStage offeredAt acceptedAt paymentConfirmedAt }`;
export const GET_CONVERSATION_OFFERS = gql`query GetConversationOffers($conversationId:String!) { getConversationOffers(conversationId:$conversationId,page:1,limit:50) { list { ...PolicyOfferFields } metaCounter { total } } } ${POLICY_OFFER_FIELDS}`;
