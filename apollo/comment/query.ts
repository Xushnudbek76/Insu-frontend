import { gql } from "@apollo/client";

export const GET_LATEST_COMMENTS = gql`
  query GetLatestComments($input: LatestCommentsInquiry!) {
    getLatestComments(input: $input) {
      list {
        _id
        commentContent
        createdAt
        memberData {
          _id
          memberNick
          memberImage
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_COMMENTS = gql`
  query GetComments($input: CommentsInquiry!) {
    getComments(input: $input) {
      list {
        _id
        commentContent
        createdAt
        memberData {
          _id
          memberNick
          memberImage
        }
      }
      metaCounter {
        total
      }
    }
  }
`;
