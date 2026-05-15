import { gql } from '@apollo/client';

export const CREATE_PACKAGE = gql`
  mutation CreatePackage($input: PackageInput!) {
    createPackage(input: $input) {
      _id
      packageType
      packageStatus
      packageTitle: packageName
      packagePrice
      packageCoverageLimit
      packageMinAge
      packageMaxAge
      packageAssetTags
      packageImages
      createdAt
      updatedAt
    }
  }
`;

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
