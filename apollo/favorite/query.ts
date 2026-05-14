import { gql } from '@apollo/client';

export const GET_FAVORITE_PACKAGES = gql`
  query GetFavoritePackages($input: OrdinaryInquiry!) {
    getFavoritePackages(input: $input) {
      list {
        _id
        packageType
        packageStatus
        packageTitle: packageName
        packagePrice
        packageImages
        packageViews
        packageLikes
        packageComments
        packageCoverageLimit
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
