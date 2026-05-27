import { gql } from '@apollo/client';

export const GET_AGENT_PACKAGES = gql`
  query GetAgentPackages($input: AgentPackagesInquiry!) {
    getAgentPackages(input: $input) {
      list {
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
        createdAt
        updatedAt
      }
      metaCounter {
        total
      }
    }
  }
`;
