import { gql } from '@apollo/client';

export const LIKE_TARGET_PACKAGE = gql`
  mutation LikeTargetPackage($packageId: String!) {
    likeTargetPackage(packageId: $packageId) {
      _id
      packageLikes
      packageViews
      meLiked {
        myFavorite
      }
    }
  }
`;
