import { gql } from '@apollo/client';

export const CREATE_BOARD_ARTICLE = gql`
  mutation CreateBoardArticle($input: BoardArticleInput!) {
    createBoardArticle(input: $input) {
      _id
      articleCategory
      articleTitle
      articleContent
      articleImage
      articleViews
      articleLikes
      articleComments
      createdAt
    }
  }
`;

export const LIKE_TARGET_BOARD_ARTICLE = gql`
  mutation LikeTargetBoardArticle($articleId: String!) {
    likeTargetBoardArticle(articleId: $articleId) {
      _id
      articleLikes
    }
  }
`;
