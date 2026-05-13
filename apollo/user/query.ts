import { gql } from '@apollo/client';

export const GET_PACKAGES = gql`
  query GetPackages($input: PackagesInquiry!) {
    getPackages(input: $input) {
      list {
        _id
        packageType
        packageStatus
        packageTitle
        packagePrice
        packageViews
        packageLikes
        packageRank
        packageImage
        packageDesc
        memberId
        createdAt
        updatedAt
        memberData {
          _id
          memberNick
          memberImage
          memberType
        }
      }
      metaCounter {
        total
      }
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
