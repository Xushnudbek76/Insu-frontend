import { gql } from '@apollo/client';

export const LOGIN_MUTATION = gql`
  mutation Login($input: LoginInput!) {
    login(input: $input) {
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
      memberWarnings
      memberBlocks
      memberProperties
      memberRank
      memberArticles
      memberPoints
      memberLikes
      memberViews
      accessToken
    }
  }
`;

export const SIGNUP_MUTATION = gql`
  mutation Signup($input: MemberInput!) {
    signup(input: $input) {
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
      memberWarnings
      memberBlocks
      memberProperties
      memberRank
      memberArticles
      memberPoints
      memberLikes
      memberViews
      accessToken
    }
  }
`;
