import { gql } from '@apollo/client';

export const GET_PACKAGES = gql`
  query GetPackages($input: PackagesInquiry!) {
    getPackages(input: $input) {
      list {
        _id
        packageType
        packageStatus
        packageTitle: packageName
        packagePrice
        packageViews
        packageLikes
        packageRank
        packageDesc
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

export const GET_PACKAGE = gql`
  query GetPackage($packageId: String!) {
    getPackage(packageId: $packageId) {
      _id
      packageType
      packageStatus
      packageTitle: packageName
      packageDesc
      packagePrice
      packageCoverageLimit
      packageMinAge
      packageMaxAge
      packageAssetTags
      packageImages
      packageViews
      packageLikes
      packageComments
      memberData {
        _id
        memberNick
        memberImage
      }
      meLiked {
        myFavorite
      }
      createdAt
      updatedAt
    }
  }
`;

export const GET_INSURANCE_RECOMMENDATION = gql`
  query GetInsuranceRecommendation($input: InsuranceRecommendationInput!) {
    getInsuranceRecommendation(input: $input) {
      riskScore
      reason
      rawFactors
      recommendedPackages {
        _id
        packageType
        packageTitle: packageName
        packagePrice
        packageDesc
      }
    }
  }
`;

export const GET_AGENTS = gql`
  query GetAgents($input: AgentsInquiry!) {
    getAgents(input: $input) {
      list {
        _id
        memberType
        memberStatus
        memberNick
        memberFullName
        memberImage
        memberRank
        memberArticles
        memberPoints
      }
      metaCounter {
        total
      }
    }
  }
`;
