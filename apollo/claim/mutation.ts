import { gql } from '@apollo/client';
import { CLAIM_FIELDS } from './query';

export const SUBMIT_CLAIM = gql`
  ${CLAIM_FIELDS}
  mutation SubmitClaim($input: SubmitClaimInput!) {
    submitClaim(input: $input) {
      ...ClaimFields
    }
  }
`;

export const UPDATE_CLAIM_STATUS = gql`
  ${CLAIM_FIELDS}
  mutation UpdateClaimStatus($input: UpdateClaimStatusInput!) {
    updateClaimStatus(input: $input) {
      ...ClaimFields
    }
  }
`;
