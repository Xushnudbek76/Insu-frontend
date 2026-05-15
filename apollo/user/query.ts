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
        packageImages
        packageViews
        packageLikes
        packageComments
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

export const GET_MEMBER = gql`
  query GetMember($memberId: String!) {
    getMember(memberId: $memberId) {
      _id
      memberType
      memberStatus
      memberPhone
      memberNick
      memberFullName
      memberImage
      memberDesc
      memberProperties
      memberRank
      memberArticles
      memberPoints
      memberLikes
      memberViews
      memberComments
      memberFollowers
      memberFollowings
      meLiked {
        memberId
        likeRefId
        myFavorite
      }
      meFollowed {
        followingId
        followerId
        myFollowing
      }
    }
  }
`;

export const GET_MEMBER_FOLLOWERS = gql`
  query GetMemberFollowers($input: FollowInquiry!) {
    getMemberFollowers(input: $input) {
      list {
        _id
        followingId
        followerId
        meFollowed {
          followingId
          followerId
          myFollowing
        }
        followerData {
          _id
          memberType
          memberNick
          memberFullName
          memberImage
          memberFollowers
          memberFollowings
          memberLikes
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_MEMBER_FOLLOWINGS = gql`
  query GetMemberFollowings($input: FollowInquiry!) {
    getMemberFollowings(input: $input) {
      list {
        _id
        followingId
        followerId
        meFollowed {
          followingId
          followerId
          myFollowing
        }
        followingData {
          _id
          memberType
          memberNick
          memberFullName
          memberImage
          memberFollowers
          memberFollowings
          memberLikes
        }
      }
      metaCounter {
        total
      }
    }
  }
`;

export const GET_AGENT_PUBLIC_PACKAGES = gql`
  query GetAgentPublicPackages($input: PackagesInquiry!) {
    getPackages(input: $input) {
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
        packageRank
        packageCoverageLimit
        packageMinAge
        packageMaxAge
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
        memberLikes
        memberViews
        memberComments
        meLiked {
          memberId
          likeRefId
          myFavorite
        }
      }
      metaCounter {
        total
      }
    }
  }
`;
