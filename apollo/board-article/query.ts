import { gql } from '@apollo/client';

export const GET_BOARD_ARTICLE = gql`
  query GetBoardArticle($articleId: String!) {
    getBoardArticle(articleId: $articleId) {
      _id
      articleCategory
      articleStatus
      articleTitle
      articleContent
      articleImage
      articleViews
      articleLikes
      articleComments
      createdAt
      updatedAt
      memberData {
        _id
        memberNick
        memberImage
      }
      meLiked {
        myFavorite
      }
    }
  }
`;

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
        meLiked {
          myFavorite
        }
      }
      metaCounter {
        total
      }
    }
  }
`;
