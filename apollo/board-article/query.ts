import { gql } from '@apollo/client';

export const GET_BOARD_ARTICLES = gql`
  query GetBoardArticles($input: BoardArticlesInquiry!) {
    getBoardArticles(input: $input) {
      list {
        _id
        articleCategory
        articleTitle
        articleContent
        articleImage
        articleViews
        articleLikes
        articleComments
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
